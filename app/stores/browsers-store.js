import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';

import {agents} from '../utils/user-agents';

class BrowsersStore {
	constructor() {
		this.bindActions(BrowsersActions);
		this.browserscopes = {
			global: {
				browsers: [
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
				]
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
