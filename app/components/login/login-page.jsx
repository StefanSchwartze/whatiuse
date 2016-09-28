// forked from @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/app/components/login-new/index.js
import React from 'react';
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

import LoginActions from 'actions/login-actions';
import LoginStore from 'stores/login-store';

@connectToStores
@changeHandler
export default class LoginPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: {}
		};
	}
	static propTypes = {
		error: React.PropTypes.string,
		LoginStore: React.PropTypes.object
	}
	static getStores() {
		return [LoginStore];
	}
	static getPropsFromStores() {
		return LoginStore.getState();
	}
	register() {
		LoginActions.register(this.state.login);
	}
	login() {
		LoginActions.login(this.state.login);
	}
	logout() {
		LoginActions.logout();
	}
	render() {
		let error;
		if(this.props.user && this.props.user.token) {
			return (
				<div className="content-container content-container--small">
					<h1 className="pagetitle">Codeimpact</h1>
					<br/>
					<p>You are already logged in. To change the user, first log out.</p>
					<button className="button button--wide button--full button--red" onClick={this.logout.bind(this)}>Logout</button>
				</div>
			)
		} else {
			if (this.props.LoginStore.error) {
				error = <p>{this.props.LoginStore.error}</p>;
			}
			return (
				<div className="content-container content-container--small login">
					<h1 className="pagetitle">Codeimpact</h1>
					<br/>
					{error}
					<input
						className="input"
						label='Username'
						type='text'
						value={this.state.login.username || ''}
						onChange={this.changeHandler.bind(this, 'login', 'username')} />
					<input
						className="input"
						label='Password'
						type='password'
						value={this.state.login.password || ''}
						onChange={this.changeHandler.bind(this, 'login', 'password')} />
					<button className="button button--wide button--full button--accent" onClick={this.register.bind(this)}>Create account</button>
					<button className="button button--wide button--full button--red" onClick={this.login.bind(this)}>Sign in</button>
				</div>
			);			
		}
	}
}
