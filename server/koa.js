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
import { flatten } from "lodash";
import { evaluate, sumObjectArrayByProp, getMissingBrowserVersions, getPercentage, getPercentageSum, addVersionUsage, whatIfIDelete } from "./utils/features";

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
		let browsers = data.browsers;
		let browserNames = [];
		for (var i = 0; i < browsers.length; i++) {
			const browserName = browsers[i].alias;
			const versions = browsers[i].version_usage;
			browserNames = browserNames.concat(versions.map((version) => browserName + ' ' + version.version));
		}
		let progress = 0;

    	const evaluateForFeatures = (item, index, that) => {
			return new Promise((resolve, reject) => {
				evaluate({ url : url, browser: item }).then(function(results) {
					io.emit('progress', { progress: (++progress) / that.length, pageId: id });
					resolve(results);
				});
			});
		}

		Promise.all(browserNames.map(evaluateForFeatures)).then(data => {
			let elementCollection = [];
			for (var i = 0; i < data.length; i++) {
				elementCollection.push(data[i].elementCollection);
			}
			let newElems = flatten(elementCollection);
			let elements = sumObjectArrayByProp(newElems, 'feature', ['missing', 'partial']);

			for (var i = 0; i < elements.length; i++) {

				let element = elements[i];
				let messages = [];

				if(element.missing) {
					let missing = sumObjectArrayByProp(element.missing, 'alias', ['versions']);
					messages.push('not supported by: ' + missing.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
					element.missing = addVersionUsage(missing, browsers);
					element.impactMissing = (getPercentageSum(element.missing)).toFixed(2);
				}
				if(element.partial) {
					let partial = sumObjectArrayByProp(element.partial, 'alias', ['versions']);
					messages.push('only partially supported by: ' + partial.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
					element.partial = addVersionUsage(element.partial, browsers);
					element.impactPartial = (getPercentageSum(element.partial)).toFixed(2);
				}
				element.message = element.title + ' ' + messages.join(' and ');
			}

			for (var k = 0; k < elements.length; k++) {

				let searchElement = elements[k];

				const elementHasBrowser = (compareBrowser) => {
					return (element) => {
						let hasBrowser = false;
						if(element.partial) {
							const containsBrowser = element.partial.find((browser) => {
								if(browser.versions.indexOf(compareBrowser.version) >= 0 &&
									browser.alias === compareBrowser.alias
								) {
									return true;
								}
								return false;
							});
							if(containsBrowser) {
								hasBrowser = true;
							}
						}
						if(element.missing) {
							const containsBrowser = element.missing.find((browser) => {
								if(browser.versions.indexOf(compareBrowser.version) >= 0 &&
									browser.alias === compareBrowser.alias
								) {
									return true;
								}
								return false;
							});
							if(containsBrowser) {
								hasBrowser = true;
							}
						}
						return hasBrowser;						
					}
				}

				const getImprovementsByBrowsers = (searchElement, elements) => {

					let improvements = [];

					const getResults = (browser, type) => {

						let result = [];

						for (var i = 0; i < browser.version_usage.length; i++) {
							
							let improvementPartial = 0;
							let improvementMissing = 0;

							const commonElements = elements
								.filter((element) => { return element.feature !== searchElement.feature})
								.filter(elementHasBrowser({alias: browser.alias, version: browser.version_usage[i].version}))
								.map((elem) => elem.feature);

							if(commonElements.length > 0) {
							} else {
								if(type === 'partial') {
									improvementPartial = browser.version_usage[i].usage;
								} else if(type === 'missing') {
									improvementMissing = browser.version_usage[i].usage;
								}
							}

							result.push({
								name: browser.alias,
								improvementPartial: improvementPartial,
								improvementMissing: improvementMissing,
								commonElements: commonElements
							});
						}

						return result;
					}

					if(searchElement.missing) {
						console.log('Some missing');
						for (var l = 0; l < searchElement.missing.length; l++) {
							const results = getResults(searchElement.missing[l], 'missing');
							for (var i = 0; i < results.length; i++) {
								improvements.push(results[i]);
							}
						}
					}
					if(searchElement.partial) {
						console.log('Some partial');
						for (var m = 0; m < searchElement.partial.length; m++) {
							const results = getResults(searchElement.partial[m], 'partial');
							for (var i = 0; i < results.length; i++) {
								improvements.push(results[i]);
							}
						}
					}

					return improvements;
				}
				let relatedElements = getImprovementsByBrowsers(searchElement, elements);

				let improvementPartial = 0;
				let improvementMissing = 0;

				for (var i = 0; i < relatedElements.length; i++) {
					if(relatedElements[i].commonElements.length === 0) {
						improvementPartial += relatedElements[i].improvementPartial;
						improvementMissing += relatedElements[i].improvementMissing;
					}
				}

				console.log('Direct improvements: ');
				console.log('Partial: ' + improvementPartial);
				console.log('Missing: ' + improvementMissing);

				console.log('Related elements to ' + searchElement.feature + ': ' + JSON.stringify(relatedElements));
			}

			const missingBrowserss = getMissingBrowserVersions(elements, 'missing');
			let send = {
				elementCollection: elements,
				browserCollection: browsers,
				pageSupport: (100 - getPercentage(missingBrowserss, browsers)).toFixed(2),
				pageId: id,
				scope: scope
			}

			page[scope + 'Support'] = send.pageSupport;

			function updatePage() {
				return axios.put('http://localhost:3000/api/pages/' + page._id, page);
			}
			function saveSnapshot() {
				return axios.post('http://localhost:3000/api/snapshots/', send);
			}

			axios
				.all([updatePage(), saveSnapshot()])
				.then(axios.spread((page, snapshot) => {
					io.emit('triggerComplete', { data: snapshot.data });
				})
			);
		});
	});

});

server.listen(process.env.PORT || config.port || 3000);

console.log(`Application started on port ${config.port}`);
if (process.send) {
	process.send("online");
}