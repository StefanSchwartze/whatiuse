import JSONStream from 'JSONStream';
import { pipe, through, concat } from 'mississippi';
import styles from 'style-stream';
import next from 'next-stream';
import doiuse from 'doiuse/stream';
import prune from './prune';
import unique from './unique';
import limitstream from './limit';
import {agents} from './user-agents';
import {clone, assign, map, flatten, findKey, forEach, find} from 'lodash';

/*
* options must have `url`.
*/
module.exports = function evaluate(args) {

	return new Promise((resolve, reject) => {

		let url = args.url || '';
		let css = args.css || '';
		let browsers = args.browsers || '';
		let streams = [styles({ url: url })];
		let errorsAndWarnings = [];
		let uniq = unique();
		let limit = limitstream(1e6);
		let features = prune();

		streams = streams.concat([
			limit,
			doiuse({ browsers: browsers.map((obj) => obj.name), skipErrors: true }, url.trim().length ? url : 'pasted content')
			.on('warning', function (warn) { 
				errorsAndWarnings.push(warn) 
			}),
			uniq.features,
			features
		]);
		let stringify = features.pipe(JSONStream.stringify());
		let error = through();

		pipe(streams,
			function (err) {
				if (err) {
					console.error('Error processing CSS', err);
					console.trace();
					if (!limit.ended) { 
						limit.end() 
					}
					if (!uniq.ended) { 
						uniq.features.end() 
					}
					stringify.end();
					if (JSON.stringify(err) === '{}') { 
						err = err.toString() 
					}
					errorsAndWarnings.push(err)
				}
				error.end(', "errors":' + JSON.stringify(errorsAndWarnings));
			}
		)
			
/*
		var cssstats = require('cssstats');
		let streamF = styles({ url: url });
		let feat = '';
		var data = streamF.pipe(through());
		//console.log(data);
		data.on('data', (data) => {
			feat = feat + data.toString('utf8');
			//console.log(feat);
		});
		data.on('end', (data) => {
			var stats = cssstats(feat, { mediaQueries: false });
			//console.log(stats);
			//resolve(stats);
		});
*/

		let usageData;
		const concatStream = next([
			'{ "args":', JSON.stringify(args), ',',
			'"features": ', stringify.pipe(through()), ',',
			'"counts": ', uniq.counts, ',',
			'"size": ', limit.size,
			error,
			'}'
			], { open: false }
		);
		const finalStream = JSONStream.parse();
		concatStream.pipe(finalStream);

		finalStream.on('data', (data) => {
			usageData = data;
		});
		finalStream.on('error', (err) => {
			reject(err);
		});
		finalStream.on('end', (err) => {

			var getMissingBrowserVersions = (feature) => {
	            let browsers = [];

	            for (var i = 0; i < feature.length; i++) {
	                browsers.push(feature[i].missing);
	            }

	            return flatten(browsers).reduce((prev, current, index, array) => {
	                let nextVersions = current.versions.replace(/[()]/g, '').replace(/,\s*$/, "").split(',');
	                if(!(current.browser in prev.keys)) {
	                    prev.keys[current.browser] = index;
	                    prev.result.push({
	                        browser: current.browser.trim(),
	                        versions: nextVersions,
	                        alias: findKey(agents, (o) => { return o.browser === current.browser.trim(); })
	                    });
	                } 
	               else {
	                    if(prev.result[prev.keys[current.browser]]) {
	                        prev.result[prev.keys[current.browser]].versions.concat(nextVersions);
	                    } else {
	                        prev.result[prev.result.length - 1].versions.concat(nextVersions);
	                    }
	               }  

	               return prev;
	            },{result: [], keys: {}}).result;
	        }

		    var getPercentage = (browserset, browsersWithPercentages) => {
		        let sum = 0;
		        forEach(browserset, function(browser, key) {
		            forEach(browser.versions, function(value, key) {
		                let obje = find(browsersWithPercentages, function(o) {
		                    return o.name === browser.alias + ' ' + value; 
		                });
		                sum += obje.share;
		            })
		        })

		        return sum;
		    }			
		    let data = {};
	        data.pageSupport = 100 - getPercentage(getMissingBrowserVersions(usageData.features), args.browsers);
	        data.elementCollection = map(usageData.features, (value, prop) => {
	            let feature = value;
	            feature.count = usageData.counts[feature.feature];
	            feature.name = feature.feature;
	            feature.impact = getPercentage(getMissingBrowserVersions([feature]), args.browsers);
	            feature.message = feature.message;
	            return feature;
	        });

			resolve(data);
		});

	});
}
