import generateApi from "./restable/lib";

import Example from "./models/example";
import User from "./models/user";
import bcrypt from "bcrypt";
import uuid from "node-uuid";

import koaRouter from "koa-router";

export default function(app) {
	const mongoUrl = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || "127.0.0.1:27017/webpackexample";
	const mongoose = require("mongoose");

	mongoose.connect(mongoUrl);

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

	// generateApi(app, User, "/api");
}

