import JSONStream from 'JSONStream';
import { pipe, through, concat } from 'mississippi';
import styles from 'style-stream';
import next from 'next-stream';
import doiuse from 'doiuse/stream';
import prune from './prune';
import unique from './unique';
import limitstream from './limit';
import {agents} from './user-agents';
import { map, flatten, findKey, forEach, find, values, uniq } from 'lodash';
import getCss from 'get-css';
import fromString from 'from2-string';

/*
* options must have `url`.
*/
module.exports = function evaluate(args) {

	return new Promise((resolve, reject) => {

		var options = {
			timeout: 5000
		};

		const url = args.url || '';
		let browsers = args.browsers || '';

		getCss(args.url, options)
			.then(function(response) {

				let streams = [fromString(response.css)];
				let errorsAndWarnings = [];
				let uniqe = unique();
				let limit = limitstream(1e6);
				let features = prune();

				browsers = browsers.map((obj) => obj.version ? (obj.name + ' ' + obj.version) : obj.name);

				streams = streams.concat([
					limit,
					doiuse({ browsers: browsers, skipErrors: true }, url.trim().length ? url : 'pasted content')
					.on('warning', function (warn) { 
						errorsAndWarnings.push(warn) 
					}),
					uniqe.features,
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
							if (!uniqe.ended) { 
								uniqe.features.end() 
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

				let usageData;
				const concatStream = next([
					'{ "args":', JSON.stringify(args), ',',
					'"features": ', stringify.pipe(through()), ',',
					'"counts": ', uniqe.counts, ',',
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

					const getMissingBrowserVersions = (features) => {
			            let browsers = [];

			            for (var i = 0; i < features.length; i++) {
			                browsers.push.apply(browsers, flatten(features[i].missing));
			            }
			            return sumBrowserVersions(browsers);
			        }

			        const sumBrowserVersions = (browsers) => {

			        	return values(browsers.reduce((prev, current, index, array) => {
			                if(!(current.alias in prev.result)) {
			                    prev.result[current.alias] = current;
			                } 
			               else if(prev.result[current.alias]) {
		                        prev.result[current.alias].versions = uniq(prev.result[current.alias].versions.concat(current.versions));
		                    }
			               return prev;
			            },{result: {}}).result);
			        }

				    const getPercentage = (browserset, browsersWithPercentages) => {
				        let sum = 0;
				        forEach(browserset, function(browser, key) {
				            forEach(browser.versions, function(value, key) {
				                let obje = find(browsersWithPercentages, function(o) {
				                    return (o.name === browser.alias + ' ' + value) || (o.name === browser.alias); 
				                });
				                if(obje) sum += parseFloat(obje.share);
				            })
				        })

				        return sum;
				    }			

				    const transformBrowserVersion = (features) => {

			            for (var i = 0; i < features.length; i++) {
				            features[i].missing = flatten(features[i].missing).reduce((prev, current, index, array) => {
				                let nextVersions = typeof current.versions === 'string' ? current.versions.replace(/[()]/g, '').replace(/,\s*$/, "").split(',') : current.versions;
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
				                    }
				               }  

				               return prev;
				            },{result: [], keys: {}}).result;
			            }
			            return features;
				    }

				    let data = {};
				    const features = transformBrowserVersion(usageData.features);

			        data.pageSupport = 100 - getPercentage(getMissingBrowserVersions(features), args.browsers);
			        data.elementCollection = map(features, (value, prop) => {
			            let feature = value;
			            feature.count = usageData.counts[feature.feature];
			            feature.name = feature.feature;
			            feature.impact = getPercentage(getMissingBrowserVersions([feature]), args.browsers);
			            feature.message = feature.message;
			            return feature;
			        });

					resolve(data);
				});
			    
			})
		  	.catch(function(error) {
		    	console.error(error);
		    	reject(error);
		    });

	});
}
