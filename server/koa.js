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

import { isEqual, differenceWith } from "lodash";
import { evaluate, sumData, getBrowserVersionShare, getMissingBrowserVersions, getWhatIfIUseElements, getCheckableBrowsers,getPercentage, getShortBrowsersWithUsage } from "./utils/features";
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
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl);
// mongoose.set('debug', true);

// connect rest-API and routes
restify(app);
routes(app);

// connect app-router
app.use(router);

var server = http.createServer(app.callback());
var io = require('socket.io')(server);

const cancelJobs = {};

io.on('connection', function(socket){

	socket.on('cancelCheck', function (data) {
		cancelJobs[data.id] = true;
	});
	socket.on('triggerURL', function (data) {
		const url = data.url;
		const id = data.id;
		const scope = data.scope;
		const page = data.page;
		const browsers = data.browsers;
		let browserNames = [];
		cancelJobs[id] = false;
		for (var i = 0; i < browsers.length; i++) {
			const browserAlias = browsers[i].alias;
			const browserName = browsers[i].browser;
			const versions = browsers[i].version_usage;
			browserNames = browserNames.concat(versions.map((version) => {
				return { 
					short: browserAlias + ' ' + version.version,
					full: browserName + ' ' + version.version,
				}
			}));
		}
		let progressComplete = 0;
		let progressCheck = 0;

		const evaluateForFeatures = (browser, index, that) => {
			return new Promise((resolve, reject) => {
				let latestData = '';
				const child = require('child_process');
				const workerProcess = child.spawn('node', [__dirname + '/utils/evaluate.js']);

				workerProcess.stdout.on('data', data => latestData += data);
				workerProcess.stderr.on('data', error => console.log('stderr: ' + error));
				workerProcess.on('close', code => {
					console.log('child process exited with code ' + code);
					io.emit('progress', {
						progress: progressComplete, 
						pageId: id,
						status: "Checking " + browser.full + "..."
					});
					progressComplete = progressComplete + (1 / that.length);

					resolve(JSON.parse(latestData));
				});
				workerProcess.stdin.setEncoding('utf-8');
				workerProcess.stdin.write(JSON.stringify({ browser, url}));
				workerProcess.stdin.end();
			});
		}

		const cancelable = data => new Promise((resolve, reject) => {
			if(cancelJobs[id]) {
				reject({
					id: id,
					message: 'Check canceled'
				});
				return;
			}
			resolve(data);
		})

		browserNames
		.reduce((promise, browser, index, array) => 
			promise.then(args => 
				cancelable().then(() => Promise.all(
					[...args, evaluateForFeatures(browser, index, array)]
				))
			), 
			Promise.all([])
		)
		.then(evaluationResults => sumData(evaluationResults, browsers))
		.then(summary => {
			const { syntaxErrors, elementCollection } = summary;
			const missingBrowsers = getMissingBrowserVersions(elementCollection, 'missing');
			const partialBrowsers = getMissingBrowserVersions(elementCollection, 'partial');
			const whatIfIUse = getWhatIfIUseElements(elementCollection, getCheckableBrowsers(partialBrowsers, browsers), getCheckableBrowsers(missingBrowsers, browsers)) || [];
			const missingSupport = getPercentage(missingBrowsers, browsers);

			let partialSupport = 0;
			const partialRest = differenceWith(getShortBrowsersWithUsage(partialBrowsers), getShortBrowsersWithUsage(missingBrowsers), isEqual);
			for (var i = 0; i < partialRest.length; i++) {
				partialSupport += partialRest[i].usage;
			}
			const sendData = {
				pageSupport: (100 - missingSupport).toFixed(2),
				browserCollection: browsers,
				elementCollection,
				syntaxErrors,
				pageId: id,
				scope,
				whatIfIUse,
				missingSupport,
				partialSupport,
				missingBrowsers,
				partialBrowsers
			}
			return sendData;
		})
		.then(cancelable)
		.then(checkResultData => new Promise((resolve, reject) => {
			const saveData = checkResultData;
			const checkableFeatures = saveData.elementCollection
				.filter(element => element.missing)
				.map(element => {
					return {
						name: element.feature,
						count: element.count,
						impact: impacts[element.feature]['impact'],
						missing: getBrowserVersionShare(element.missing)
					}
				});
			const child = require('child_process');
			const workerProcess = child.spawn('node', [__dirname + '/utils/optim_set.js']);
			let latestData = '';

			workerProcess.stdout.on('data', data => latestData += data);
			workerProcess.stderr.on('data', error => {
				console.log('stderr: ' + error);
				reject(error);
			});
			workerProcess.on('close', code => {
				console.log('child process exited with code ' + code);
				saveData.whatIfIDelete = JSON.parse(latestData);
				resolve(saveData);
			});
			workerProcess.stdin.setEncoding('utf-8');
			workerProcess.stdin.write(JSON.stringify(checkableFeatures));
			workerProcess.stdin.end();
		}))
		.then(saveData => {
			page[scope + 'Support'] = saveData.pageSupport;
			Promise
				.all([Page.findOneAndUpdate({_id: page._id}, page), new Snapshot(saveData).save()])
				.then(result => io.emit('triggerComplete', { data: result[1] }))
				.catch(error => console.log(`Error on saving entity to DB: ${error}`));
		})
		.catch(error => {
			if(error.id) {
				io.emit('cancelComplete', { id: error.id });
				return;
			}
			console.log(error);
		});
	});

});

server.listen(process.env.PORT || config.port || 3000);

console.log(`Application started on port ${config.port}`);
if (process.send) {
	process.send("online");
}