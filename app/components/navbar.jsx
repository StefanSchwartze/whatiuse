import React from 'react';
import Modal, {closeStyle} from 'simple-react-modal';
import connectToStores from 'alt-utils/lib/connectToStores';
import {Link} from 'react-router';
import Tooltip from 'rc-tooltip';
import classnames from 'classnames';
import { findItemById } from 'utils/store-utils';
import { agents } from 'utils/user-agents';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Configurator from './configurator';
import Uploader from './uploader';

import StatusStore from 'stores/status-store';
import BrowsersStore from 'stores/browsers-store';
import ProjectsStore from 'stores/projects-store';

import LoginActions from 'actions/login-actions';
import StatusActions from 'actions/status-actions';
import BrowserActions from 'actions/browsers-actions';
import ProjectActions from 'actions/projects-actions';

@connectToStores
export default class Navbar extends React.Component {
	constructor(props) {
		super();
		this.state = { showModal: false };
	}
	static getStores() {
		return [
			StatusStore,
			ProjectsStore,
			BrowsersStore,
		];
	}
	static getPropsFromStores() {
		return {
			status: StatusStore.getState(),
			browserScope: BrowsersStore.getState().currentScope,
			browserscopes: BrowsersStore.getState().browserscopes,
			agents: BrowsersStore.getState().agents,
			projects: ProjectsStore.getState().projects,
			currentProjectId: ProjectsStore.getState().currentProjectId
		}
	}
	componentWillMount() {
		ProjectActions.fetch();
		ProjectActions.get(this.props.params.id);
		BrowserActions.fetchGlobal();
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
		BrowserActions.fetchConfig();
		this.setState({showModal: !this.state.showModal});
	}
	handleTabSelect(index) {
		this.setState({tabIndex: index})
	}
	addGlobalBrowserset() {
		var browsers = [
					{
						"alias":"ie",
						"browser":"IE",
						"version_usage":{
							"8":0.629643,
							"9":0.427062,
							"11":4.87837
						}
					},
					{
						"alias":"and_chr",
						"browser":"Chrome for Android",
						"version_usage":{
							"51":19.4722
						}
					},
					{
						"alias":"and_uc",
						"browser":"UC Browser for Android",
						"version_usage":{
							"9.9":6.6515
						}
					},
					{
						"alias":"android",
						"browser":"Android Browser",
						"version_usage":{
							"4.2-4.3":0.626031,
							"4.4.3-4.4.4":0.98683,
							"4.4":1.65044
						}
					},
					{
						"alias":"chrome",
						"browser":"Chrome",
						"version_usage":{
							"29":1.02336,
							"48":0.4264,
							"49":2.42515,
							"50":6.81707,
							"51":17.2852,
							"52":0.09594
						}
					},
					{
						"alias":"edge",
						"browser":"Edge",
						"version_usage":{
							"13":1.35382
						}
					},
					{
						"alias":"firefox",
						"browser":"Firefox",
						"version_usage":{
							"39":0.06396,
							"45":0.27183,
							"46":2.30256,
							"47":3.78963,
							"48":0.12259
						}
					},
					{
						"alias":"ios_saf",
						"browser":"iOS Safari",
						"version_usage":{
							"8.1-8.4":0.466736,
							"9.0-9.2":1.00746,
							"9.3":7.14444
						}
					},
					{
						"alias":"op_mini",
						"browser":"Opera Mini",
						"version_usage":{
							"5.0-8.0":4.69025
						}
					},
					{
						"alias":"opera",
						"browser":"Opera",
						"version_usage":{
							"36":0.05863,
							"37":0.19188,
							"38":0.3198
						}
					},
					{
						"alias":"safari",
						"browser":"Safari",
						"version_usage":{
							"8":0.20787,
							"9":2.36244,
						}
					},
				];
		BrowserActions.add(browsers);
	}
	render() {
		let errorComponent;
		let retryComponent;
		let busyComponent;
		let currentProject = findItemById(this.props.projects, this.props.currentProjectId) || '';
		if (this.props.status.error) {
			if (this.props.retryData) {
				retryComponent = <li className="nav-list-item"><button onClick={this.retry} className="">Retry</button></li>;
			}
			errorComponent = (<p><strong>Network Error!</strong>{retryComponent}</p>);
		}
		// Prerender busy on server as not to lose markup state on client
		if (this.props.status.busy || !process.env.BROWSER) {
			busyComponent = <i className="fa fa-refresh fa-spin"></i>;
		}
		return (
			<header className="header">
				<div className="header-content content-container edged">
					<nav className="navigation navigation--first">
						<ul className="nav-list">
							<li className="nav-list-item button button--accent">
								{currentProject.title}
								<Link to='/' className="link"><span className="icon-menu"></span></Link>
							</li>
							<li className="nav-list-item" onClick={this.addGlobalBrowserset.bind(this)}>
								<span className="icon-add"></span>
							</li>
							<li className="nav-list-item toggle">
								{this.props.browserscopes && Object.keys(this.props.browserscopes).map(
									(item, key) => 
									<div key={key}
										className={classnames('toggle-button', this.props.browserScope == item ? 'active' : '')}
										onClick={this.selectBrowserScope.bind(this, item)}><span className={"icon-" + item}></span> {item}</div>
									)
								}
							</li>
							<Modal 
								transitionSpeed={250}
								className="modal"
								containerClassName={classnames('animate', 'modal-container', 'checked', 'modal-container--wide')}
								closeOnOuterClick={true}
								show={this.state.showModal}
							>
								<div className="modal-head">
									<span>Browser settings</span>
									<button className="icon-close button button--close" onClick={() => this.setState({ showModal: false })}></button>
								</div>
								<Tabs
											onSelect={(index) => this.setState({ tabIndex: index })}
											selectedIndex={this.state.tabIndex}
										>
											<TabList>
												<Tab>Configurator</Tab>
												<Tab>Upload</Tab>
											</TabList>
											<TabPanel>
												{ (() => {
													if(currentProject !== '') {
														return (
															<Configurator 
																currentProject={currentProject} 
																browsers={this.props.browserscopes.custom.browsers} 
																agents={this.props.agents} 
																onSend={() => this.setState({ showModal: false })} 
															/>
														)
													}													
												})()}
											</TabPanel>
											<TabPanel>
												<Uploader
													onSend={() => this.setState({ showModal: false })}
												/>	
											</TabPanel>
										</Tabs>
							</Modal>
							<li 
								className={classnames('nav-list-item', this.state.showModal ? 'active' : '')} 
								onClick={this.showModal.bind(this)}
							>
								<span className="icon-settings"></span>
							</li>
							<li className="nav-list-item" onClick={this.logout.bind(this)}>
								<a href="#" className="link"><span className="icon-enter"></span></a>
							</li>
						</ul>
						{busyComponent}
					</nav>
					<nav className="navigation navigation--second">
						<ul className="nav-list">
							<li className="nav-list-item">
								<Link 
									to={'/projects/' + currentProject._id} 
									activeClassName="active"
									className="link">
									<span className="icon-home"></span>Dashboard
								</Link>
							</li>
							<li className="nav-list-item">
								<Link 
									to={'/projects/' + currentProject._id + '/browsers'} 
									activeClassName="active"
									className="link">
									<span className="icon-pie-chart"></span>Browsers
								</Link>
							</li>
						</ul>
						{busyComponent}
					</nav>
				</div>
				{errorComponent}
			</header>
		);
	}
}


