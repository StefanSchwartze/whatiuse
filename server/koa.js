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
import { flatten, intersectionWith, isEqual, find, mergeWith, drop, values, isArray } from "lodash";
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

			//console.log('Just look from here, not earlier!');
			for (var i = 0; i < elements.length; i++) {

				let element = elements[i];
				let messages = [];

				if(element.missing) {
					//console.log('Before: ' + JSON.stringify(element.missing));
					let missing = sumObjectArrayByProp(element.missing, 'alias', ['versions']);
					//console.log('After: ' + JSON.stringify(missing));
					messages.push('not supported by: ' + missing.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
					element.missing = addVersionUsage(missing, browsers);
					element.impactMissing = (getPercentageSum(element.missing)).toFixed(2);
				}
				if(element.partial) {
					//console.log('Before: ' + JSON.stringify(element.partial));
					let partial = sumObjectArrayByProp(element.partial, 'alias', ['versions']);
					//console.log('After: ' + JSON.stringify(partial));
					messages.push('only partially supported by: ' + partial.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
					element.partial = addVersionUsage(partial, browsers);
					element.impactPartial = (getPercentageSum(element.partial)).toFixed(2);
				}
				element.message = element.title + ' ' + messages.join(' and ');
			}

			for (var k = 0; k < elements.length; k++) {

				let searchElement = elements[k];

				const getAllElementBrowsers = (element) => {
					let allBrowsers = [];
					if(element.partial) {
						let browsers = getShortBrowsers(element.partial);
						allBrowsers.push.apply(allBrowsers, browsers);
						}
					if(element.missing) {
						let browsers = getShortBrowsers(element.missing);
						allBrowsers.push.apply(allBrowsers, browsers);
					}
					return allBrowsers;
				}
				const getShortBrowsers = (collection) => {
					let shortBrowsers = [];
					for (var i = 0; i < collection.length; i++) {
						const browser = collection[i];
						for (var j = 0; j < browser.versions.length; j++) {
							shortBrowsers.push({
								alias: browser.alias,
								version: browser.versions[j]
							});
						}
					}
					return shortBrowsers;
				}
				const elementHasBrowsers = (checkElement, compareBrowsers, excludeElement = {}) => {
					let exclude = excludeElement.feature ? (excludeElement.feature === checkElement.feature) : false;
					if(!exclude) {
						let checkElemBrowsers = getAllElementBrowsers(checkElement);
						const diff = intersectionWith(checkElemBrowsers, compareBrowsers, isEqual);
						return diff.length > 0;
					}	
					return false;
				}
				const getElementsByBrowsers = (browsers, elementCollection) => {
					return elementCollection
						.filter(element => elementHasBrowsers(element, browsers))
						.map(elem => elem.feature);
				}
				const getSortedBrowsersByElements = (element, elementCollection) => {

					let allBrowsers = getAllElementBrowsers(element);
					let repeatedlyUsedBrowsers = [];
					let uniqueBrowsers = [];

					for (var i = 0; i < allBrowsers.length; i++) {
						const browser = allBrowsers[i];
						let isUniq = true;
						let j = 0;
						while(j < elementCollection.length && isUniq) {
							const hasBrowser = elementHasBrowsers(elementCollection[j], [browser], element);
							if(hasBrowser) {
								isUniq = false;
							} else {
								j++;
							}
						}
						if(isUniq) {
							uniqueBrowsers.push(browser);
						} else {
							repeatedlyUsedBrowsers.push(browser);
						}
					}
					return {
						uniqueBrowsers: uniqueBrowsers,
						repeatedlyUsedBrowsers: repeatedlyUsedBrowsers
					}
				}
				const getUniqueBrowsersByElements = (searchElements, elementCollection, browserset) => {

					const uniqueBrowsers = browserset.filter((browser) => {
						let isOkay = true;
						let countOfMatchElems = 0;
						let j = 0;
						// check all elements for browser
						while(j < elementCollection.length && isOkay) {

							const currentElement = elementCollection[j];
							const browsersFromElement = getAllElementBrowsers(currentElement);
							const hasBrowser = find(browsersFromElement, (foundBrowser) => { return isEqual(foundBrowser, browser) });
							let isOneOf = false;
							
							if(hasBrowser) {
								// check if matching element is one of the searched ones
								for (var i = 0; i < searchElements.length; i++) {
									if(currentElement.feature === searchElements[i]) {
										countOfMatchElems = countOfMatchElems + 1;
										isOneOf = true;
									}
								}
								if(isOneOf) {
									isOkay = true;
									j++;
								} else {
									isOkay = false;
								}

							} else {
								j++;
							}
						}
						// when browser has not matched in all searched elements, kick browser
						if(countOfMatchElems !== searchElements.length) {
							isOkay = false;
						}
						return isOkay;
					});
					return uniqueBrowsers;
				}

				// all browsers of the searched element sorted by group (unique = only used by this element | repeatedly = by more elements used)
				const sortedBrowsers = getSortedBrowsersByElements(searchElement, elements);
				// the unique browsers from element; can directly have impact by removing element
				// all elements that also use the browsers from the searched element
				const commonElements = getElementsByBrowsers(sortedBrowsers.repeatedlyUsedBrowsers, elements.filter(element => element.feature !== searchElement.feature));
				
				// check if the repeatedly used browsers from searched element are unique by an element pair
				console.log('Unique browsers by ' + searchElement.feature);
				console.log(sortedBrowsers.uniqueBrowsers);
				if(commonElements.length > 0) {
					for (var i = 0; i < commonElements.length; i++) {
						const uniques = getUniqueBrowsersByElements([searchElement.feature, commonElements[i]], elements, sortedBrowsers.repeatedlyUsedBrowsers);
						if(uniques.length > 0) {
							console.log('Browsers that are only used by ' + searchElement.feature + ' and ' + commonElements[i]);
							console.log(uniques);
						}
					}
					console.log('Final ultimate wtf-combination: ');
					const newarr = commonElements;
					newarr.push(searchElement.feature);
					const sss = getUniqueBrowsersByElements(newarr, elements, sortedBrowsers.repeatedlyUsedBrowsers);
				}

				const calcValues = (browsers, browsersWithPercentages) => {
					let sum = 0;
					for (var i = 0; i < browsers.length; i++) {
						const currBrowser = browsers[i];
						let percBrowser = find(browsersWithPercentages, (browser) => {
			                return browser.alias === currBrowser.alias; 
			            });
			            if(percBrowser) {
			            	const version = find(percBrowser.version_usage, (version) => {
				                return version.version === currBrowser.version; 
				            });
				            sum += parseFloat(version.usage);
			            }
					}
					return sum;
				}

				const selfDel = {
					partial: searchElement.partial ? calcValues(sortedBrowsers.uniqueBrowsers, searchElement.partial) : 0,
					missing: searchElement.missing ? calcValues(sortedBrowsers.uniqueBrowsers, searchElement.partial) : 0
				}

				const deletePossibilities = {
					self: selfDel,
					others: [],
					all: []
				}

				searchElement.deletePossibilities = deletePossibilities;

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