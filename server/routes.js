import koaRouter from "koa-router";
import bcrypt from "bcrypt";
import uuid from "node-uuid";
import User from "./models/user";
import urlToImage from "url-to-image";
import normalizeBrowsers from "./utils/normalize-browsers";
import { camelCase } from "lodash";

export default (app) => {

	const appRouter = koaRouter();

	appRouter.post("/auth/register", function*(next) {
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

	appRouter.post("/auth/login", function*(next) {
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

	appRouter.post("/image", function*(next) {
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

	appRouter.post("/browsers/validate", function*(next) {
		this.set({
			'Content-Type' : 'application/json',
			'Access-Control-Allow-Origin' : '*'
		});
		let data = normalizeBrowsers(this.request.body.browsers);
		this.status = 200;
		this.body = { message: "Browsers evaluated successfully!", browsers: data };
	});

	appRouter.get("/status", function*(next) {
		this.status = 200;
	});

	app
		.use(appRouter.routes())
		.use(appRouter.allowedMethods());

}