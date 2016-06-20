import {agents} from './user-agents';
import {clone, assign, map, flatten, findKey, forEach, find, head} from 'lodash';

module.exports = function normalizeBrowsers(browsers) {

	return new Promise((resolve, reject) => {
		let unknownBrowsersList = [];
		let validBrowsersList = [];

		const calculateShares = function(browsers) {

			const getSum = function(browsers) {
				let sum = 0;
				forEach(browsers, (browser) => {
					let val = browser.count;
					sum += val;
				});
				return sum;
			}
			const sum = getSum(browsers);

			return browsers.map((browser) => {
				let browserN = browser;
				browserN.share = browserN.count / sum;
				return browserN;
			});

		};

		if(head(browsers).count >= 1) {


			//browsers = calculateShares(browsers);

		}

		//for
		
/*
		findName();
			if found

			else
				findNameSiblings
					> unknownList.push(items);
*/




		//reject(err);
		let data = calculateShares(browsers);
		resolve(data);

	});
}
