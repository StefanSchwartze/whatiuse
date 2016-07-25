import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById, deconstructBrowserArray} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';

import {agents} from '../utils/user-agents';

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
		this.agents = agents;
		this.currentScope = 'global';
	}
	onAdd(browsers) {
		this.browserscopes.global.browsers = deconstructBrowserArray(browsers.browsers);
	}
	onFetchGlobal(snapshots) {
		let browserCollection;
		if(snapshots.length && snapshots.length > 0) {
			browserCollection = snapshots[0].browsers;
		}
		else {
			browserCollection = [];
		}
		this.browserscopes.global.browsers = deconstructBrowserArray(browserCollection);
	}
	onFetchConfig(config) {
		this.browserscopes.custom = config;
	}
	onFetchCustom(config) {
		this.browserscopes.fdx = config;
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
