import alt from 'utils/alt';
import axios from 'axios';

class LoginActions {
	constructor() {
		this.generateActions('logout', 'loadLocalUser');
	}
	login(data) {
		return async (dispatch) => {
			try {
				const response = await axios.post('/auth/login', data);
				dispatch({ok: true, user: response.data});
			} catch (err) {
				console.error(err);
				dispatch({ok: false, error: err.data});
			}
		}
	}
	register(data) {
		return async (dispatch) => {
			try {
				const response = await axios.post('/auth/register', data);
				dispatch({ok: true, user: response.data});
			} catch (err) {
				console.error(err);
				dispatch({ok: false, error: err.data});
			}
		}
	}
}

module.exports = (alt.createActions(LoginActions));
