import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import {Link} from 'react-router';

import StatusStore from 'stores/status-store';
import StatusActions from 'actions/status-actions';
import LoginActions from 'actions/login-actions';

@connectToStores
export default class Navbar extends React.Component {
	static contextTypes = {
		router: React.PropTypes.func
	}
	static getStores() {
		return [
			StatusStore
		];
	}
	static getPropsFromStores() {
		return StatusStore.getState();
	}
	retry() {
		StatusActions.retry();
	}
	logout() {
		LoginActions.logout();
	}
	render() {
		let errorComponent;
		let retryComponent;
		let busyComponent;
		if (this.props.error) {
			if (this.props.retryData) {
				retryComponent = <button onClick={this.retry} className="">Retry</button>;
			}
			errorComponent = (
				<p><strong>Network Error!</strong>{retryComponent}</p>);
		}
		// Prerender busy on server as not to lose markup state on client
		if (this.props.busy || !process.env.BROWSER) {
			busyComponent = <div className=""><i className="fa fa-refresh fa-spin"></i></div>;
		}
		return (
			<header className="header">
				<div className="header-content content-container">
					<nav className="navigation">
						<ul className="nav-list">
							<li className="nav-list-item">
								<Link to='app' className="link">Dashboard</Link>
							</li>
							<li className="nav-list-item" onClick={this.logout.bind(this)}>
								<a href="#" className="link">Logout</a>
							</li>
							<li className="nav-list-item">
								{busyComponent}
							</li>
						</ul>
					</nav>
				</div>
				{errorComponent}
			</header>
		);
	}
}


