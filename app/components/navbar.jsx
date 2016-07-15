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
							<li className="nav-list-item toggle">
								{this.props.browserscopes && Object.keys(this.props.browserscopes).map(
									(item, key) => 
									<div key={key}
										className={classnames('toggle-button', this.props.browserScope == item ? 'active' : '')}
										onClick={this.selectBrowserScope.bind(this, item)}><span className={"icon-" + item}></span> {item}</div>
									)
								}
							</li>
							
							<Tooltip 
								overlayClassName="tooltip--local"
								visible={this.state.showModal}
								placement="bottom"
								mouseEnterDelay={0}
								mouseLeaveDelay={0}
								destroyTooltipOnHide={true}
								overlay={
									<div className="modal-container modal-container--wide">


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
									</div>
								}
							>
								<li 
									className={classnames('nav-list-item withOverlay', this.state.showModal ? 'active' : '')} 
									onClick={this.showModal.bind(this)}
								>
									<span className="icon-settings"></span>
								</li>
					        </Tooltip>
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


