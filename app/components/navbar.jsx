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
import SnapshotsActions from 'actions/snapshots-actions';

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
			projects: ProjectsStore.getState().projects,
			currentProjectId: ProjectsStore.getState().currentProjectId
		}
	}
	componentWillMount() {
		ProjectActions.get(this.props.params.projectid);
		this.selectBrowserScope(this.props.params.scope);
	}
	retry() {
		StatusActions.retry();
	}
	logout() {
		LoginActions.logout();
	}
	selectBrowserScope(scope) {
		BrowserActions.fetch(scope, this.props.params.projectid);
		BrowserActions.selectScope(scope);
		SnapshotsActions.fetch({
			"conditions": { 
				pageId: this.props.params.pageid,
				scope: scope
			}
		});
	}
	showModal(){
		BrowserActions.fetch(this.props.params.scope, this.props.params.projectid);
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
				"version_usage":[
					{
						"version":"8",
						"usage":0.629643
					},
					{
						"version":"9",
						"usage":0.427062
					},
					{
						"version":"11",
						"usage":4.87837
					}
				]
			},
			{
				"alias":"and_chr",
				"browser":"Chrome for Android",
				"version_usage":[
					{
						"version":"51",
						"usage":19.4722
					}
				]
			},
			{
				"alias":"and_uc",
				"browser":"UC Browser for Android",
				"version_usage":[
					{
						"version":"9.9",
						"usage":6.6515
					}
				]
			},
			{
				"alias":"android",
				"browser":"Android Browser",
				"version_usage":[
					{
						"version":"4.2-4.3",
						"usage":0.626031
					},
					{
						"version":"4.4.3-4.4.4",
						"usage":0.98683
					},
					{
						"version":"4.4",
						"usage":1.65044
					}
				]
			},
			{
				"alias":"chrome",
				"browser":"Chrome",
				"version_usage":[
					{
						"version":"29",
						"usage":1.02336
					},
					{
						"version":"48",
						"usage":0.4264
					},
					{
						"version":"49",
						"usage":2.42515
					},
					{
						"version":"50",
						"usage":6.81707
					},
					{
						"version":"51",
						"usage":17.2852
					},
					{
						"version":"52",
						"usage":0.09594
					}
				]
			},
			{
				"alias":"edge",
				"browser":"Edge",
				"version_usage":[
					{
						"version":"13",
						"usage":1.35382
					}
				]
			},
			{
				"alias":"firefox",
				"browser":"Firefox",
				"version_usage":[
					{
						"version":"39",
						"usage":0.06396
					},
					{
						"version":"45",
						"usage":0.27183
					},
					{
						"version":"46",
						"usage":2.30256
					},
					{
						"version":"47",
						"usage":3.78963
					},
					{
						"version":"48",
						"usage":0.12259
					}
				]
			},
			{
				"alias":"ios_saf",
				"browser":"iOS Safari",
				"version_usage":[
					{
						"version":"8.1-8.4",
						"usage":0.466736
					},
					{
						"version":"9.0-9.2",
						"usage":1.00746
					},
					{
						"version":"9.3",
						"usage":7.14444
					}
				]
			},
			{
				"alias":"op_mini",
				"browser":"Opera Mini",
				"version_usage":[
					{
						"version":"5.0-8.0",
						"usage":4.69025
					}
				]
			},
			{
				"alias":"opera",
				"browser":"Opera",
				"version_usage":[
					{
						"version":"36",
						"usage":0.05863
					},
					{
						"version":"37",
						"usage":0.19188
					},
					{
						"version":"38",
						"usage":0.3198
					}
				]
			},
			{
				"alias":"safari",
				"browser":"Safari",
				"version_usage":[
					{
						"version":"8",
						"usage":0.20787
					},
					{
						"version":"9",
						"usage":2.36244
					}
				]
			}
		];
		BrowserActions.add(browsers);
	}
	render() {
		let errorComponent;
		let retryComponent;
		let busyComponent;
		let currentProject = findItemById(this.props.projects, this.props.currentProjectId) || '';
		let currentScope = this.props.params.scope;
		/*if (this.props.status.error) {
			console.log(this.props.status);
			if (this.props.retryData) {
				retryComponent = <li className="nav-list-item"><button onClick={this.retry} className="">Retry</button></li>;
			}
			errorComponent = (<p><strong>Network Error!</strong>{retryComponent}</p>);
		}*/
		// Prerender busy on server as not to lose markup state on client
		if (this.props.status.busy || !process.env.BROWSER) {
			busyComponent = <span className="icon icon-sync animate rotate"></span>;
		}
		return (
			<header className="header">
				<div className="header-content content-container edged">
					<nav className="navigation navigation--first">
						<ul className="nav-list">
							<li className="nav-list-item title">
								{/*<img 
									src={require('images/code_impact.png')}
									className="navbar-logo"
								/>*/}
								<div className="navbar-title">
									<span>CODE IMPACT</span>
									<span>{currentProject.title}<Link to='/' className="link"><span className="icon-menu"></span></Link></span>
								</div>
							</li>
							<li className="nav-list-item" onClick={this.addGlobalBrowserset.bind(this)}>
								<span className="icon-add"></span>
							</li>
							<li className="nav-list-item toggle">
								{this.props.browserscopes && Object.keys(this.props.browserscopes).map((scope, key) => {
									const url = this.props.location.pathname.replace(new RegExp(currentScope, 'g'), scope);
									return (
										<Link 
											key={key}
											to={url} 
											activeClassName="active"
											className={classnames('toggle-button')}
											onClick={this.selectBrowserScope.bind(this, scope)}>
											<span className={"icon-" + scope}></span> {scope}
										</Link>)
										
									})
								}
								<Tooltip
									overlayClassName="tooltip--simple"
									placement="bottom"
									mouseEnterDelay={0}
									mouseLeaveDelay={0}
									destroyTooltipOnHide={true}
									overlay={
										<div style={{maxWidth: 320}}>
											Select which dataset of browsers you want to evaluate.
										</div>
									}
								>
								<span className="icon-help helper"></span>
						        </Tooltip>
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
																agents={agents} 
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
							<li className="nav-list-item loading">
								{busyComponent}
							</li>
							<li 
								className={classnames('options', 'nav-list-item', this.state.showModal ? 'active' : '')} 
								onClick={this.showModal.bind(this)}
							>
								<span className="icon-settings"></span>Options
							</li>
							<li className="nav-list-item logout" onClick={this.logout.bind(this)}>
								<a href="#" className="link"><span className="icon-enter"></span>Logout</a>
							</li>
						</ul>
					</nav>
					<nav className="navigation navigation--second">
						<ul className="nav-list">
							<li className="nav-list-item">
								<Link 
									to={'/projects/' + currentProject._id + '/' + currentScope + '/pages'} 
									activeClassName="active"
									className="link">
									<span className="icon-home"></span>Pages
								</Link>
							</li>
							<li className="nav-list-item">
								<Link 
									to={'/projects/' + currentProject._id + '/' + currentScope + '/browsers'} 
									activeClassName="active"
									className="link">
									<span className="icon-pie-chart"></span>Browsers
								</Link>
							</li>
						</ul>
					</nav>
				</div>
				{errorComponent}
			</header>
		);
	}
}


