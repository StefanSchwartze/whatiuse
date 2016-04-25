'use strict';

import React from 'react';
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt/utils/connectToStores';

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
	static contextTypes = {
		router: React.PropTypes.func
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
	componentWillMount() {
		this.state = {
			login: {}
		};
	}
	register() {
		LoginActions.register(this.state.login);
	}
	login() {
		LoginActions.login(this.state.login);
	}
	render() {
		var error;
		if (this.props.LoginStore.error) {
			error = <p>{this.props.LoginStore.error}</p>;
		}
		return (
			<div className="container startpage">
				<div className="content-container content-container--small">
					<h1 className="pagetitle"><i className="fa fa-clock-o left"></i>Codeimpact</h1>
					<h3 className="pagedesc">Subtitle</h3>
					<h2>Sign in or create a new account.</h2>
					<br/>
					{error}
					<input
						className="input"
						label='Username'
						type='text'
						value={this.state.login.username}
						onChange={this.changeHandler.bind(this, 'login', 'username')} />
					<input
						className="input"
						label='Password'
						type='password'
						value={this.state.login.password}
						onChange={this.changeHandler.bind(this, 'login', 'password')} />
					<button className="button button--wide button--yellow" onClick={this.register.bind(this)}>Create account</button>
					<button className="button button--wide button--red" onClick={this.login.bind(this)}>Sign in</button>
				</div>
			</div>
		);
	}
}
