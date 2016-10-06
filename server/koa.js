import koa from "koa";
import path from "path";
import http from "http";
import debug from "debug";
import hbs from "koa-hbs";
import mount from "koa-mount";
import serve from "koa-static";
import helmet from "koa-helmet";
import logger from "koa-logger";
import favicon from "koa-favicon";
import bodyParser from "koa-body-parser";
import staticCache from "koa-static-cache";
import responseTime from "koa-response-time";

import router from "./router";
import routes from "./routes";
import restify from './rest-api';
import config from "./config/init";

import axios from "axios";
import { flatten, flattenDeep, intersectionWith, isEqual, find, mergeWith, drop, values, isArray, uniqWith, uniqBy, xorWith, differenceBy, differenceWith, difference, findIndex } from "lodash";
import { evaluate, sumResults, getBrowserVersionShare, getElementBrowserVersion, saveCSV } from "./utils/features";
import impacts from "./utils/feature-impact";

import Page from "./models/page";
import Snapshot from "./models/snapshot";

const app = koa();
const env = process.env.NODE_ENV || "development";

app.use(responseTime());
app.use(logger());

// various security headers
app.use(helmet.defaults());

if (env === "production") {
	app.use(require("koa-conditional-get")());
	app.use(require("koa-etag")());
	app.use(require("koa-compressor")());

	// Cache pages
	const cache = require("lru-cache")({maxAge: 3000});
	app.use(require("koa-cash")({
		get: function*(key) {
			return cache.get(key);
		},

		set: function*(key, value) {
			cache.set(key, value);
		}
	}));
}

if (env === "development") {
	// set debug env, must be programmaticaly for windows
	debug.enable("dev,koa");

	// log when process is blocked
	require("blocked")((ms) => debug("koa")(`blocked for ${ms}ms`));
}

app.use(favicon(path.join(__dirname, "../app/images/favicon.ico")));
app.use(hbs.middleware({
	defaultLayout: "index",
	layoutsPath: path.join(__dirname, "/views/layouts"),
	viewPath: path.join(__dirname, "/views")
}));

const cacheOpts = {maxAge: 86400000, gzip: true};

// Proxy asset folder to webpack development server in development mode
if (env === "development") {
	var webpackConfig = require("../webpack/dev.config");
	app.use(mount("/assets", require("koa-proxy")({ host: `http://localhost:${webpackConfig.server.port}` })));
}
else {
	app.use(mount("/assets", staticCache(path.join(__dirname, "../dist"), cacheOpts)));
}
app.use(serve(__dirname + '/../public'));

// Parse body
app.use(bodyParser({jsonLimit: '50mb'}));

// connect database
const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "127.0.0.1:27017/whatiuse";
const mongoose = require("mongoose");
mongoose.connect(mongoUrl);

// connect rest-API and routes
restify(app);
routes(app);

// connect app-router
app.use(router);

var server = http.createServer(app.callback());
var io = require('socket.io')(server);

io.on('connection', function(socket){

	socket.on('triggerURL', function (data) {

		const url = data.url;
		const id = data.id;
		const scope = data.scope;
		let page = data.page;
		const browsers = data.browsers;
		let browserNames = [];
		for (var i = 0; i < browsers.length; i++) {
			const browserName = browsers[i].alias;
			const versions = browsers[i].version_usage;
			browserNames = browserNames.concat(versions.map((version) => browserName + ' ' + version.version));
		}
		let progress = 0;

		const saveResults = (send) => {
			page[scope + 'Support'] = send.pageSupport;
			function updatePage(page) {
				return new Promise((resolve, reject) => {
					Page.findOneAndUpdate({id: page._id}, page, (err, result) => {
						if(err) reject(err);
						resolve(result);
					});
				});
			}
			function saveSnapshot(data) {
				return new Promise((resolve, reject) => {
					var snapshot = new Snapshot(data);
					snapshot.save((err, result) => {
						if(err) reject(err);
						resolve(result);
					});
				});
			}
			Promise
				.all([updatePage(page), saveSnapshot(send)])
				.then(result => {
					io.emit('triggerComplete', { data: result[1] });
				})
				.catch(e => {
					console.log('Error on saving entity to DB');
					console.log(e);
				});					
		}

		const getUnsupportedFeaturesByBrowsers = (browserNames) => {

			const evaluateForFeatures = (browser, index, that) => {
				return new Promise((resolve, reject) => {
					evaluate({ url : url, browser: browser })
						.then(function(results) {
							io.emit('progress', {
								progress: (++progress) / that.length, 
								pageId: id
							});
							resolve(results);
						})
						.catch(e => {
							console.log(e);
							console.log('Caused by: ' + browser);
							io.emit('progress', {
								progress: (++progress) / that.length, 
								pageId: id
							});
							resolve([
								{ 
									elementCollection: [],
									syntaxErrors: []
								}
							]);
						});
				});
			}

			var p = Promise.resolve();
			var results = [];
			return browserNames.reduce((p, browser, index, array) => {
				return p.then(result => { 
					if(result) {
						results.push(result);
					}
					return evaluateForFeatures(browser, index, array); 
				});
			}, p)
			.then(result => {
				results.push(result);
				const send = sumResults(results, browsers, id, scope);
 				saveResults(send);

				const elements = send.elementCollection;


				//console.log('********************FEATURE-COUNT*********************');
				const elementCountImpact = elements.map((element) => {return {
					name: element.feature,
					count: element.count,
					impact: impacts[element.feature]['impact']
				}});

				//console.log('********************BROWSER-SHARE*********************');
				const browserShare = getBrowserVersionShare(send.missingBrowsers);

				//console.log('********************FEATURE-BROWSER*********************');
				const featureBrowser = []
				for (var i = 0; i < elements.length; i++) {
					if(elements[i].missing) {
						featureBrowser.push.apply(featureBrowser, getElementBrowserVersion(elements[i].missing, elements[i].feature));
					}
				}
				return [elementCountImpact, browserShare, featureBrowser];
			})
			.then(checkResultData => {

				Promise
					.all(checkResultData.map(saveCSV))
					.then(csvFiles => {

						var child = require('child_process');
						var python = child.spawn('python', [__dirname + '/compute_input.py']),
							dataString = '';

						python.stdout.on('data', function(data){
							console.log('Data: ' + data);
							//dataString += data.toString();
						});
						python.stdout.on('end', function(){
							//console.log('Sum of numbers=',dataString);
						});
						python.stderr.on('data', function (data) {
							console.log('stderr: ' + data);
						});
						python.on('close', function (code) {
							console.log('child process exited with code ' + code);
						});
						python.stdin.write(JSON.stringify(csvFiles.join('/u')));
						python.stdin.end();

					})
					.catch((e) => {
						console.log('very late error');
						console.log(e);
					});

			});

		}
		

		getUnsupportedFeaturesByBrowsers(browserNames);

		// Promise
		// 	.all(browserNames.map(evaluateForFeatures))
		// 	.then(results => {

		// 		const send = sumResults(results, browsers, id, scope);
		// 		saveResults(send);

		// 	})
		// 	.catch((e) => {
		// 		console.log('very late error');
		// 		console.log(e);
		// 		io.emit('triggerComplete', { pageId: id, error: e });
		// 	});

	});

});

server.listen(process.env.PORT || config.port || 3000);

console.log(`Application started on port ${config.port}`);
if (process.send) {
	process.send("online");
}