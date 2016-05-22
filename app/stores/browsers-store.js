import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import BrowsersActions from 'actions/browsers-actions';

class BrowsersStore {
	constructor() {
		this.bindActions(BrowsersActions);
		this.browsers = {
			global: [
				{
					name: 'and_chr 49',
					share: 16.4703,
				},
				{
					name: 'and_uc 9.9',
					share: 8.96896,
				},
				{
					name: 'android 4.4',
					share: 1.79132,
				},
				{
					name: 'android 4.4.3-4.4.4',
					share: 0.959138,
				},
				{
					name: 'android 4.2-4.3',
					share: 0.86491,
				},

				{
					name: 'chrome 49',
					share: 14.0861,
				},

				{
					name: 'chrome 48',
					share: 12.9742,
				},

				{
					name: 'chrome 47',
					share: 0.699696,
				},
				{
					name: 'edge 13',
					share: 0.970896,
				},
				{
					name: 'firefox 45',
					share: 2.5547,
				},
				{
					name: 'firefox 44',
					share: 3.73714,
				},
				{
					name: 'ie 11',
					share: 5.68963,
				},
				{
					name: 'ie 9',
					share: 0.52888,
				},
				{
					name: 'ie 8',
					share: 0.768267,
				},
				{
					name: 'ie_mob 11',
					share: 0.621478,
				},
				{
					name: 'ios_saf 9.3',
					share: 1.39559,
				},
				{
					name: 'ios_saf 9.0-9.2',
					share: 5.60179,
				},
				{
					name: 'ios_saf 8.1-8.4',
					share: 0.707518,
				},
				{
					name: 'op_mini 5.0-8.0',
					share: 4.92252,
				},
				{
					name: 'safari 9',
					share: 0.168144,
				}
			]
		};
		this.currentSource = 'global';
	}
	onSelectGlobal() {
		this.currentSource = 'global';
	}
}

module.exports = (alt.createStore(BrowsersStore));
