import React from 'react';
import Modal, {closeStyle} from 'simple-react-modal';
import connectToStores from 'alt-utils/lib/connectToStores';
import {Link} from 'react-router';
import Tooltip from 'rc-tooltip';
import classnames from 'classnames';
import { findItemById } from 'utils/store-utils';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Dropzone from 'react-dropzone';
import Configurator from './configurator';
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
			browsers: BrowsersStore.getState().browsers,
			agents: BrowsersStore.getState().agents,
			projects: ProjectsStore.getState().projects,
			currentProjectId: ProjectsStore.getState().currentProjectId
		}
	}
	componentDidMount() {
		ProjectActions.fetch();
		ProjectActions.get('5756be4c57ce5aef23861c7d');
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
	closeModal(){
		this.setState({showModal: false})
	}
	closeProjectModal(){
		this.setState({showProjectModal: false})
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
								<button className="button button--yellow" onClick={() => this.setState({showProjectModal: true})}><span className="icon-add"></span>Add project</button>
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
								{this.props.browsers && Object.keys(this.props.browsers).map(
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
											onSelect={this.handleSelect}
											selectedIndex={0}
										>
											<TabList>
												<Tab>Configurator</Tab>
												<Tab>Upload</Tab>
											</TabList>
											<TabPanel>
												<Configurator 
													currentProject={findItemById(this.props.projects, this.props.currentProjectId)} 
													browsers={this.props.browsers.custom} 
													agents={this.props.agents} 
													onSend={this.closeModal.bind(this)} 
												/>
											</TabPanel>
											<TabPanel>
												<Dropzone className="dropzone-container" onDrop={this.onDrop}>
													<div className="dropzone-content">
														<p>Try dropping some files here, or click to select files to upload.</p>
													</div>
												</Dropzone>
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


