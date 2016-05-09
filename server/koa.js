import path from "path";
import debug from "debug";

import koa from "koa";
import hbs from "koa-hbs";
import mount from "koa-mount";
import helmet from "koa-helmet";
import logger from "koa-logger";
import favicon from "koa-favicon";
import staticCache from "koa-static-cache";
import responseTime from "koa-response-time";
import bodyParser from "koa-bodyparser";
// import koaRouter from "koa-router";
import generateApi from "./restable/lib";
import koaRouter from "koa-router";

import router from "./router";
import config from "./config/init";

import rest from "./rest";
import {clone} from "lodash";

import http from "http";

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















// Parse body
app.use(bodyParser());

import bcrypt from "bcrypt";
import uuid from "node-uuid";

import User from "./models/user";
import Page from "./models/page";
import Example from "./models/example";

	const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "127.0.0.1:27017/whatiuse";
	const mongoose = require("mongoose");

	mongoose.connect(mongoUrl);

	var PagesController = generateApi(app, Page, "/api");
	PagesController.mount();

	var ExamplesController = generateApi(app, Example, "/api");
	ExamplesController.mount();

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

	var checkRouter = koaRouter();

	checkRouter.post("/check", function*(next) {
		yield next;


		this.set({
			'Content-Type' : 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});


var request = require('request');
var cssFeatures = require('../app/utils/css-features');
var limit = require('../app/utils/limit');

var JSONStream = require('JSONStream');
var pipe = require('mississippi').pipe;
var through = require('mississippi').through;
var fromString = require('from2-string');
var styles = require('style-stream');
var next = require('next-stream');
var doiuse = require('doiuse/stream');
var defaultBrowsers = require('doiuse').default;

var prune = require('../app/utils/prune');
var unique = require('../app/utils/unique');
var limitstream = require('../app/utils/limit');


		function run(args, res) {
			return new Promise(function(resolve, reject) {

				var url = args.url || '';
  				var css = args.css || '';
  				var browsers = args.browser || ''

				var streams = [styles({ url: url })];

				var errorsAndWarnings = [];
				var uniq = unique();
				var limit = limitstream(1e6);
				var features = prune();
				streams = streams.concat([
					limit,
					doiuse({ browsers: browsers, skipErrors: true }, url.trim().length ? url : 'pasted content')
					.on('data', function(data) { console.log(data)})
					.on('warning', function (warn) { errorsAndWarnings.push(warn) }),
					uniq.features,
					features
				]);
				var stringify = features.pipe(JSONStream.stringify());
				var error = through();
				pipe(streams, function (err) {
					if (err) {
						console.error('Error processing CSS', err)
						console.trace()
						if (!limit.ended) { limit.end() }
						if (!uniq.ended) { uniq.features.end() }
						stringify.end()
						if (JSON.stringify(err) === '{}') { err = err.toString() }
						errorsAndWarnings.push(err)
					}
					error.end(', "errors":' + JSON.stringify(errorsAndWarnings))
				})

				// construct JSON output stream
				pipe(next(['{ "args":', JSON.stringify(args), ',',
					'"usages": ', stringify.pipe(through()), ',',
					'"counts": ', uniq.counts, ',',
					'"size": ', limit.size,
					error,
					'}'
					], { open: false }), res, function (err) {
						if (err) { 
							console.error(err) 
						}
						res.end();
				})
			});
		}

		yield run({ url : 'http://stefanschwartze.com' }, this.res);

	});


	app
		.use(checkRouter.routes())
		.use(checkRouter.allowedMethods());
		




app.use(router);
var port = process.env.PORT || config.port || 3000;
console.log(app.callback);
var server = http.createServer(app.callback());

server.listen(port);


console.log(`Application started on port ${config.port}`);
if (process.send) {
	process.send("online");
}
