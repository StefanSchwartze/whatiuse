import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';

import {agents} from '../utils/user-agents';

class BrowsersStore {
	constructor() {
		this.bindActions(BrowsersActions);
		this.browsers = {
			global: [
				{ 
					name: 'and_chr 50',
					share: 17.0049 
				},
				{ 
					name: 'and_uc 9.9',
					share: 9.16597 
				},
				{ 
					name: 'android 4.4',
					share: 1.68994 
				},
				{ 
					name: 'android 4.4.3-4.4.4',
					share: 2.621749 
				},
				{ 
					name: 'android 4.2-4.3',
					share: 0.778934 
				},
				{ 
					name: 'chrome 50',
					share: 1.99318 
				},
				{ 
					name: 'chrome 49',
					share: 24.0789 
				},
				{ 
					name: 'chrome 48',
					share: 0.889428 
				},
				{ 
					name: 'chrome 45',
					share: 0.56259 
				},
				{ 
					name: 'chrome 29',
					share: 0.680466 
				},
				{ 
					name: 'edge 13',
					share: 1.08232 
				},
				{ 
					name: 'firefox 45',
					share: 5.71699 
				},
				{ 
					name: 'ie 11',
					share: 5.42872 
				},
				{ 
					name: 'ie 9',
					share: 0.514125 
				},
				{ 
					name: 'ie 8',
					share: 0.768423 
				},
				{ 
					name: 'ios_saf 9.3',
					share: 5.21039 
				},
				{ 
					name: 'ios_saf 9.0-9.2',
					share: 2.01021 
				},
				{ 
					name: 'ios_saf 8.1-8.4',
					share: 0.621755 
				},
				{ 
					name: 'op_mini 5.0-8.0',
					share: 5.04151 
				},
				{ 
					name: 'opera 36',
					share: 0.675108 
				},
				{ 
					name: 'safari 9.1',
					share: 0.96444 
				},
				{ 
					name: 'safari 9',
					share: 0.787626
				}
			],
			custom: []
		};
		this.agents = agents;
		this.currentScope = 'global';
	}
	onFetchConfig(config) {
		this.browsers.custom = config;
	}
	onSelectScope(scope) {
		this.currentScope = scope;
	}
	onUpdate(data) {
		let newBrowsers = this.browsers;
		newBrowsers[data.type] = data.browsers;
		assign(this.browsers, newBrowsers);
	}
}

module.exports = (alt.createStore(BrowsersStore));
