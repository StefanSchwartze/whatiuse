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
import { data as caniuseData } from "caniuse-db/fulldata-json/data-1.0";
import { flatten, intersectionWith, isEqual, find, mergeWith, drop, values, isArray, uniqWith, xorWith, differenceWith, difference } from "lodash";
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
						.filter((element) => {
							const checkElemBrowsers = getAllElementBrowsers(element);
							const diff = intersectionWith(checkElemBrowsers, browsers, isEqual);
							return diff.length > 0;
						})
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
							
							if(hasBrowser) {
								let isOneOf = false;
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
						if(countOfMatchElems > searchElements.length) {
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
				            if(version) {
				            	sum += parseFloat(version.usage);
				            }
			            }
					}
					return sum;
				}

				const isBrowserUniqueInScope = (browser, scope, elementCollection, sourceElement) => {
					let matchCount = 0;
					let j = 0;
					while(j < elementCollection.length && matchCount < 1) {
						let hasBrowser = false;
						if(elementCollection[j].feature !== sourceElement.feature && elementCollection[j][scope]) {
							const diff = intersectionWith(getShortBrowsers(elementCollection[j][scope]), [browser], isEqual);
							hasBrowser = diff.length > 0;
						}
						if(hasBrowser) {
							matchCount += 1;
						}
						j++;
					}
					return matchCount < 1;
				}

				let repeatedlyUsedInPartial = 0;
				let repeatedlyUsedInMissing = 0;

				if(searchElement.partial) {
					repeatedlyUsedInPartial += calcValues(sortedBrowsers.uniqueBrowsers, searchElement.partial);
					
					const browsers = sortedBrowsers.repeatedlyUsedBrowsers;

					for (var i = 0; i < browsers.length; i++) {
						if(isBrowserUniqueInScope(browsers[i], 'partial', elements, searchElement)) {
							repeatedlyUsedInPartial += calcValues([browsers[i]], searchElement.partial);
						}
					}
					
				}
				if(searchElement.missing) {
					repeatedlyUsedInMissing += calcValues(sortedBrowsers.uniqueBrowsers, searchElement.missing);
					
					const browsers = sortedBrowsers.repeatedlyUsedBrowsers;
					
					for (var i = 0; i < browsers.length; i++) {
						if(isBrowserUniqueInScope(browsers[i], 'missing', elements, searchElement)) {
							repeatedlyUsedInMissing += calcValues([browsers[i]], searchElement.missing); 
						}
					}
				}

				const selfDel = {
					partial: repeatedlyUsedInPartial,					
					missing: repeatedlyUsedInMissing
				}

				let othersDel = [];

				for (var i = 0; i < commonElements.length; i++) {

					const fullElem = elements.find(element => element.feature === commonElements[i]);

					let overallset = getAllElementBrowsers(fullElem);
					overallset.push.apply(overallset, sortedBrowsers.repeatedlyUsedBrowsers);

					const uniqueBrowsers = getUniqueBrowsersByElements([searchElement.feature, commonElements[i]], elements, uniqWith(overallset, isEqual));
					if(uniqueBrowsers.length > 0) {
						othersDel.push({
							feature: commonElements[i],
							partial: parseFloat(selfDel.partial) + (fullElem.partial ? calcValues(uniqueBrowsers, fullElem.partial) : 0),
							missing: parseFloat(selfDel.missing) + (fullElem.missing ? calcValues(uniqueBrowsers, fullElem.missing) : 0)
						});
					}
				}

				const deletePossibilities = {
					self: selfDel,
					others: othersDel,
					all: []
				}

				searchElement.deletePossibilities = deletePossibilities;
			}

			const whatIfIDelete = (element) => {
				let changes = {
					missing: 0,
					partial: 0
				}
				return changes;
			}

			let allCssElements = [];
			const keys = Object.keys(caniuseData);
			for (var i = 0; i < keys.length; i++) {
				if(caniuseData[keys[i]].categories.indexOf('CSS') >= 0 || caniuseData[keys[i]].categories.indexOf('CSS3') >= 0) {
					allCssElements.push(caniuseData[keys[i]]);
				}
			}

			const missingBrowsers = getMissingBrowserVersions(elements, 'missing');
			const partialBrowsers = getMissingBrowserVersions(elements, 'partial');
			const allBrowsers = flatten([missingBrowsers, partialBrowsers]);

			const rest = values(browsers.reduce( (prev, current, index, array) => {
				const browsersWithSameName = allBrowsers.filter(browser => browser.alias === current.alias);
				
				if(browsersWithSameName.length > 0) {
					const allVersionUsage = browsersWithSameName.length > 1 ?
						flatten([browsersWithSameName[0].version_usage, browsersWithSameName[1].version_usage]) :
						browsersWithSameName[0].version_usage;
					const allVersions = browsersWithSameName.length > 1 ?
						flatten([browsersWithSameName[0].versions, browsersWithSameName[1].versions]) :
						browsersWithSameName[0].versions;

					const version_usage = differenceWith(current.version_usage, allVersionUsage, isEqual);

					if(version_usage.length > 0) {
						prev.result[current.alias] = {
							browser: current.browser,
							alias: current.alias,
							version_usage: version_usage
						};
					}
				} else {
					prev.result[current.alias] = current;
				}
				return prev;
			},{result: {}}).result);

			let send = {
				elementCollection: elements,
				browserCollection: browsers,
				pageSupport: (100 - getPercentage(missingBrowsers, browsers)).toFixed(2),
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