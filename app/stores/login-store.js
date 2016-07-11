import alt from "utils/alt";
import {defer} from "lodash";
import api from "utils/api";
import LoginActions from "actions/login-actions";

// import {routerObject} from "utils/store-utils";
// var router = require("router");
import router from "router";

const USER_STORAGE_KEY = "appUser";

class LoginStore {
	constructor() {
		this.bindActions(LoginActions);
		this.user = null;
		this.error = null;
	}

	saveUser(data) {
		if (data.ok) {
			this.storeUser(data.user);
			this.redirectToHome();
		}
		else {
			this.error = data && data.error && data.error.message;
			this.clearUser();
			// this.error = data.error.message;
			this.redirectToLogin();
		}
	}

	storeUser(user) {
		this.user = user;
		this.error = null;
		api.updateToken(user.token);
		localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
	}

	loadLocalUser() {
		if (!process.env.BROWSER) {
			return;
		}

		var user;
		try {
			user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
		} finally {
			if (user) {
				console.log("loadLocalUser");
				console.log(user);
				this.storeUser(user);
			}
		}
	}

	clearUser() {
		this.user = null;
		api.updateToken(null);
		localStorage.removeItem(USER_STORAGE_KEY);
	}

	redirectToHome() {
		defer(router.props.history.pushState.bind(this, null, `/`, null));
	}

	redirectToLogin() {
		defer(router.props.history.pushState.bind(this, null, `/login`, null));
	}

	onLogin(data) {
		this.saveUser.bind(this)(data);
	}

	onRegister(data) {
		this.saveUser.bind(this)(data);
	}

	onLogout() {
		this.clearUser();
		this.redirectToLogin();
	}
}

module.exports = (alt.createStore(LoginStore));
