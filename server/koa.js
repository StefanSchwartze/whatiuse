import path from "path";
import debug from "debug";
import koa from "koa";
import hbs from "koa-hbs";
import mount from "koa-mount";
import helmet from "koa-helmet";
import logger from "koa-logger";
import favicon from "koa-favicon";
import staticCache from "koa-static-cache";
import serve from "koa-static";
import responseTime from "koa-response-time";
import bodyParser from "koa-bodyparser";
import koaRouter from "koa-router";
import {clone, camelCase, flatten, values, find, forEach, uniq, merge, sumBy, groupBy, value, map as _map} from "lodash";
import http from "http";

import router from "./router";
import config from "./config/init";

import generateApi from "./restable/lib";

import evaluate from "./utils/features";
import normalizeBrowsers from "./utils/normalize-browsers";
import browserslist from "browserslist";

import urlToImage from "url-to-image";

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

import bcrypt from "bcrypt";
import uuid from "node-uuid";

import User from "./models/user";
import Page from "./models/page";
import Project from "./models/project";

	const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "127.0.0.1:27017/whatiuse";
	const mongoose = require("mongoose");

	mongoose.connect(mongoUrl);

	var ProjectController = generateApi(app, Project, "/api");
	ProjectController.mount();

	var PagesController = generateApi(app, Page, "/api");
	PagesController.mount();

	var authRouter = koaRouter();

	authRouter.post("/auth/register", function*(next) {
		yield next;
		const SALT_WORK_FACTOR = 10;
		const error = {message: "Username already exists"};
		try {
			const body = this.request.body;
			const salt = yield bcrypt.genSalt.bind(this, SALT_WORK_FACTOR);
			const hash = yield bcrypt.hash.bind(this, body.password, salt);
			body.password = hash;
			body.token = uuid.v1();
			const result = yield User.create(body);
			this.status = 201;
			this.body = result;
		} catch (err) {
			this.status = 409;
			this.body = error;
		}
	});

	authRouter.post("/auth/login", function*(next) {
		yield next;
		try {
			const body = this.request.body;
			const error = { message: "Username and password doesn't match" };
			const user = yield User.findOne({
				username: body.username
			});
			if (!user) throw error;
			const match = yield bcrypt.compare.bind(this, body.password, user.password);
			if (!match) throw error;
			user.token = uuid.v1();
			this.status = 201;
			this.body = yield user.save();
		} catch (err) {
			this.status = 401;
			this.body = err;
		}
	});

	app
		.use(authRouter.routes())
		.use(authRouter.allowedMethods());

	var imageRouter = koaRouter();

	imageRouter.post("/image", function*() {

		this.set({
			'Content-Type' : 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});

		let options = {
		    width: 1280,
		    height: 800,
		    cropHeight: true,
		    fileQuality: 100,
		    requestTimeout: 100
		}
		let fileName = camelCase(this.request.body.title + new Date().getTime()) + '.png';
		let filePath = (__dirname + '/../public/' + fileName);
		let self = this;
		yield urlToImage(this.request.body.url, filePath, options).then(function() {
			self.status = 200;
			self.body = { message: "Image was created successfully!", imgSrc: fileName };
		}).catch(function(err) {
			console.error(err);
			self.body = { err: err, message: "Image could not be created!" };
		});

	});

	app
		.use(imageRouter.routes())
		.use(imageRouter.allowedMethods());

	var uploadRouter = koaRouter();

	uploadRouter.post("/browsers/validate", function*() {

		this.set({
			'Content-Type' : 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});

		let data = normalizeBrowsers(this.request.body.browsers);
		this.status = 200;
		this.body = { message: "Browsers evaluated successfully!", browsers: data };

	});

	app
		.use(uploadRouter.routes())
		.use(uploadRouter.allowedMethods());
		
app.use(router);

var server = http.createServer(app.callback());
var io = require('socket.io')(server);

io.on('connection', function(socket){

	socket.on('triggerURL', function (data) {

		const url = data.url;
		const id = data.id;
		let browsers = data.browsers;
		let browserNames = [];
		for (var i = 0; i < browsers.length; i++) {
			const browserName = browsers[i].alias;
			const versions = browsers[i].version_usage;
			browserNames = browserNames.concat(Object.keys(versions).map((version) => browserName + ' ' + version));
		}
		let progress = 0;

    	const doit = (item, index, that) => {
			return new Promise((resolve, reject) => {
				evaluate({ url : url, browser: item }).then(function(results) {
					io.emit('progress', { progress: (++progress) / that.length, pageId: id });
					resolve(results);
				});
			});
		}

		Promise.all(browserNames.map(doit)).then(data => {
			let elementCollection = [];
			for (var i = 0; i < data.length; i++) {
				elementCollection.push(data[i].elementCollection);
			}
			let newElems = flatten(elementCollection);

			const sumObjectArrayByProp = (array, reduceProp, unifyingProps) => {

				return values(array.reduce((prev, current, index, array) => {
	                if(!(current[reduceProp] in prev.result)) {
	                    prev.result[current[reduceProp]] = current;
	                }
					else if(prev.result[current[reduceProp]]) {

						for (var i = 0; i < unifyingProps.length; i++) {
							const currProp = unifyingProps[i];
							const additionalElementsOfProp = current[currProp];

							if(additionalElementsOfProp) {
							
								let additionalElements = current[currProp];

								if(prev.result[current[reduceProp]][currProp]) {
									if(typeof additionalElements === 'string') {
										prev.result[current[reduceProp]][currProp] += ('\n' + additionalElements);
									} else {
										for (var j = 0; j < additionalElements.length; j++) {
											prev.result[current[reduceProp]][currProp].push(additionalElements[j]);
										}
									}
								} else {
									prev.result[current[reduceProp]][currProp] = additionalElements;
								}
							}

						}

					}
	               return prev;
	            },{result: {}}).result);

			}
			const getMissingBrowserVersions = (features, type) => {
	            let browsers = [];

	            for (var i = 0; i < features.length; i++) {
	            	if(features[i][type]) {
		                browsers.push.apply(browsers, flatten(features[i][type]));
	            	}
	            }
	            return sumBrowserVersions(browsers);
	        }
	        const sumBrowserVersions = (browsers) => {

	        	return values(browsers.reduce((prev, current, index, array) => {
	                if(!(current.alias in prev.result)) {
	                    prev.result[current.alias] = current;
	                } 
	               else if(prev.result[current.alias]) {
                        prev.result[current.alias].versions = uniq(prev.result[current.alias].versions.concat(current.versions));
                    }
	               return prev;
	            },{result: {}}).result);
	        }
		    const getPercentage = (browserset, browsersWithPercentages) => {
		        let sum = 0;
		        forEach(browserset, function(browser, key) {
		            forEach(browser.versions, function(value, key) {
		                let obje = find(browsersWithPercentages, function(o) {
		                    return (o.name === browser.alias + ' ' + value) || (o.name === browser.alias); 
		                });
		                if(obje) {
		                	sum += parseFloat(obje.share);
		            	}
		            })
		        })

		        return sum;
		    }

			let elements = sumObjectArrayByProp(newElems, 'feature', ['missing', 'partial']);

			for (var i = 0; i < elements.length; i++) {

				let element = elements[i];
				let messages = [];

				if(element.missing) {
					element.missing = sumObjectArrayByProp(element.missing, 'alias', ['versions']);
					messages.push('not supported by: ' + element.missing.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
				}
				if(element.partial) {
					element.partial = sumObjectArrayByProp(element.partial, 'alias', ['versions']);
					messages.push('only partially supported by: ' + element.partial.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
				}
				element.message = element.title + ' ' + messages.join(' and ');

				const missingBrowserss = getMissingBrowserVersions([element], 'missing');
				element.impact = (getPercentage(missingBrowserss, browsers)).toFixed(2);

			}

			const missingBrowserss = getMissingBrowserVersions(elements, 'missing');
			let send = {
				elementCollection: elements,
				browserCollection: browsers,
				pageSupport: (100 - getPercentage(missingBrowserss, browsers)).toFixed(2),
				pageId: id
			}

			io.emit('triggerComplete', { data: send });
		});
	});

});

var port = process.env.PORT || config.port || 3000;

server.listen(port);

console.log(`Application started on port ${config.port}`);
if (process.send) {
	process.send("online");
}