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
import ProjectForm from './shared/forms/project-form';

import StatusStore from 'stores/status-store';
import BrowsersStore from 'stores/browsers-store';
import ProjectsStore from 'stores/projects-store';

import LoginActions from 'actions/login-actions';
import StatusActions from 'actions/status-actions';
import BrowserActions from 'actions/browsers-actions';
import ProjectActions from 'actions/projects-actions';

@connectToStores
export default class Navbar extends React.Component {
	static contextTypes = {
		router: React.PropTypes.func
	}
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
		const id = this.context.router.getCurrentParams().id;
		ProjectActions.fetch();
		ProjectActions.get(id);
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
		this.setState({showModal: true})
	}
	showBrowserModal(){
		this.setState({showBrowserModal: true})
	}
	closeModal(){
		this.setState({showModal: false})
	}
	closeProjectModal(){
		this.setState({showProjectModal: false})
	}
	closeBrowserModal(){
		this.setState({showBrowserModal: false})
	}
	handleTabSelect(index) {
		this.setState({tabIndex: index})
	}
	render() {
		let errorComponent;
		let retryComponent;
		let busyComponent;
		let currentProject = findItemById(this.props.projects, this.props.currentProjectId) || '';
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
								<button className="button button--accent" onClick={() => this.setState({showProjectModal: true})}>
									{currentProject.title}
								</button>
								<button className="button button--accent" onClick={() => this.setState({showProjectModal: true})}>
									<span className="icon-add"></span>
								</button>
								<Modal 
									transitionSpeed={250}
									className="modal"
									containerClassName={classnames('animate', 'modal-container', 'checked')}
									closeOnOuterClick={true}
									show={this.state.showProjectModal}
									onClose={this.closeProjectModal.bind(this)} >
									<div className="modal-head">
										<span>Add new project</span>
										<button className="icon-close button button--close" onClick={this.closeProjectModal.bind(this)}></button>
									</div>
									<ProjectForm onSend={this.closeProjectModal.bind(this)} />
								</Modal>
							</li>
							<li className="nav-list-item">
								<div className="toggle">
								{this.props.browserscopes && Object.keys(this.props.browserscopes).map(
									(item, key) => 
									<div key={key}
										className={classnames('toggle-button', this.props.browserScope == item ? 'active' : '')}
										onClick={this.selectBrowserScope.bind(this, item)}><span className={"icon-" + item}></span> {item}</div>
									)
								}
								</div>
							</li>
							<Tooltip 
								overlayClassName="tooltip--local"
								visible={this.state.showBrowserModal}
								placement="bottom"
								mouseEnterDelay={0}
								mouseLeaveDelay={0}
								destroyTooltipOnHide={true}
								overlay={
									<div className="modal-container">


										<div className="modal-head">
											<span>Browser set</span>
											<button className="icon-close button button--close" onClick={this.closeBrowserModal.bind(this)}></button>
										</div>
										<div className="browsers">
											{this.props.browserscopes[this.props.browserScope] && this.props.browserscopes[this.props.browserScope].browsers.map(
												(item, key) => 
												<div className="justify" key={key}>
													{agents[item.name] ? agents[item.name].browser : item.name} | {item.version} | {item.share}
												</div>
												)
											}
										</div>
									</div>
								}
							>
								<li 
									className={classnames('nav-list-item withOverlay', this.state.showBrowserModal ? 'active' : '')} 
									onClick={this.showBrowserModal.bind(this)}
								>
									Browsers
								</li>
					        </Tooltip>
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
											<button className="icon-close button button--close" onClick={this.closeModal.bind(this)}></button>
										</div>
										<Tabs
											onSelect={this.handleTabSelect.bind(this)}
											selectedIndex={this.state.tabIndex}
										>
											<TabList>
												<Tab>Configurator</Tab>
												<Tab>Upload</Tab>
											</TabList>
											<TabPanel>
												<Configurator 
													currentProject={findItemById(this.props.projects, this.props.currentProjectId)} 
													browsers={this.props.browserscopes.custom.browsers} 
													agents={this.props.agents} 
													onSend={this.closeModal.bind(this)} 
												/>
											</TabPanel>
											<TabPanel>
												<Uploader
													onSend={this.closeModal.bind(this)}
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
							{busyComponent}
						</ul>
					</nav>
				</div>
				{errorComponent}
			</header>
		);
	}
}


