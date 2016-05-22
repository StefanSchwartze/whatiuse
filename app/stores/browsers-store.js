import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';

class BrowsersStore {
	constructor() {
		this.bindActions(BrowsersActions);
		this.browsers = {
			global: [ 
				'and_chr 49',
				'and_uc 9.9',
				'android 4.4',
				'android 4.4.3-4.4.4',
				'android 4.2-4.3',
				'chrome 49',
				'chrome 48',
				'chrome 47',
				'edge 13',
				'firefox 45',
				'firefox 44',
				'ie 11',
				'ie 9',
				'ie 8',
				'ie_mob 11',
				'ios_saf 9.3',
				'ios_saf 9.0-9.2',
				'ios_saf 8.1-8.4',
				'op_mini 5.0-8.0',
				'safari 9' 
			]
		};
		this.currentSource = 'global';
	}
	onSelectGlobal() {
		this.currentSource = 'global';
	}
}

module.exports = (alt.createStore(BrowsersStore));
