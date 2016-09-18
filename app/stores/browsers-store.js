import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';
import ProjectsStore from 'stores/projects-store';

class BrowsersStore {
	constructor() {
		this.bindActions(BrowsersActions);
		this.browserscopes = {
			global: {
				browsers: []
			},
			custom: {
				browsers: []
			},
			fdx: {
				browsers: []
			}
		};
		this.currentScope = null;
	}
	onAdd(browsers) {
		this.browserscopes.global.browsers = browsers.browsers;
	}
	onFetchGlobal(snapshots) {
		let browserCollection;
		if(snapshots.length && snapshots.length > 0) {
			browserCollection = snapshots[0].browsers;
		}
		else {
			browserCollection = [];
		}
		this.browserscopes.global.browsers = browserCollection;
	}
	onFetchFdx(project) {
		this.browserscopes.fdx = project ? project.browserscopes.fdx : {};
	}
	onFetchCustom(project) {
		this.browserscopes.custom.browsers = project ? project.browserscopes.config.browsers : [];
	}
	onValidateBrowserset(data) {
		this.browserscopes.fdx = data.data;
	}
	onSelectScope(scope) {
		this.currentScope = scope;
	}
	onUpdate(data) {
		let newBrowsers = this.browserscopes;
		newBrowsers[data.type].browsers = data.browsers;
		assign(this.browserscopes, newBrowsers);
	}
}

module.exports = (alt.createStore(BrowsersStore));
