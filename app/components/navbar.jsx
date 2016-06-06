import React from 'react';
import Modal, {closeStyle} from 'simple-react-modal';
import connectToStores from 'alt-utils/lib/connectToStores';
import {Link} from 'react-router';
import classnames from 'classnames';

import Configurator from './configurator';

import StatusStore from 'stores/status-store';
import BrowsersStore from 'stores/browsers-store';

import StatusActions from 'actions/status-actions';
import LoginActions from 'actions/login-actions';
import BrowserActions from 'actions/browsers-actions';

@connectToStores
export default class Navbar extends React.Component {
	constructor(props) {
		super();
		this.state = { showModal: false };
	}
	static contextTypes = {
		router: React.PropTypes.func
	}
	static getStores() {
		return [
			StatusStore,
			BrowsersStore
		];
	}
	static getPropsFromStores() {
		return {
			status: StatusStore.getState(),
			browserScope: BrowsersStore.getState().currentScope,
			browsers: BrowsersStore.getState().browsers,
			agents: BrowsersStore.getState().agents
		}
	}
	retry() {
		StatusActions.retry();
	}
	logout() {
		LoginActions.logout();
	}
	selectBrowserScope(scope) {
		BrowserActions.selectScope(scope);
	}
	showModal(){
		this.setState({showModal: true})
	}
	closeModal(){
		this.setState({showModal: false})
	}
	render() {
		let errorComponent;
		let retryComponent;
		let busyComponent;
		if (this.props.error) {
			if (this.props.retryData) {
				retryComponent = <li className="nav-list-item"><button onClick={this.retry} className="">Retry</button></li>;
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
							<li className="nav-list-item">
								<div className="toggle">
								{this.props.browsers && Object.keys(this.props.browsers).map(
									(item, key) => 
									<div key={key}
										className={classnames('toggle-button', this.props.browserScope == item ? 'active' : '')}
										onClick={this.selectBrowserScope.bind(this, item)}>{item}</div>
									)
								}
								</div>
								<Modal 
									transitionSpeed={250}
									className="modal"
									containerClassName={classnames('animate', 'modal-container', 'modal-container--wide', 'checked')}
									closeOnOuterClick={true}
									show={this.state.showModal}
									onClose={this.closeModal.bind(this)} >
									<div className="modal-head">
										<span>Configurator</span>
										<button className="icon-close button button--close" onClick={this.closeModal.bind(this)}></button>
									</div>
									<Configurator browsers={this.props.browsers.custom} agents={this.props.agents} onSend={this.closeModal.bind(this)} />
								</Modal>
							</li>
							<li className="nav-list-item" onClick={this.showModal.bind(this)}>Settings</li>
							<li className="nav-list-item" onClick={this.logout.bind(this)}>
								<a href="#" className="link">Logout</a>
							</li>
							{busyComponent}
						</ul>
					</nav>
				</div>
				{errorComponent}
			</header>
		);
	}
}


