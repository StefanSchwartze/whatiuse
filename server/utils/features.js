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

module.exports = function evaluate(args) {

	return new Promise((resolve, reject) => {

		const url = args.url || '';
		const browser = args.browser || '';
		const options = {
			timeout: 5000,
			headers: { 
				'User-Agent': browser 
			}
		};

		getCss(args.url, options)
			.then(function(response) {

				let streams = [fromString(response.css)];
				let errorsAndWarnings = [];
				let uniqe = unique();
				let limit = limitstream(1e6);
				let features = prune();


				streams = streams.concat([
					limit,
					doiuse({ browsers: browser, skipErrors: true }, url.trim().length ? url : 'pasted content')
					.on('warning', function (warn) {
						console.log(warn);
						errorsAndWarnings.push(warn);
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
					
				    const transformBrowserVersion = (features) => {

			            for (var i = 0; i < features.length; i++) {
			            	if(features[i].missing) {
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

				            if(features[i].partial) {
					            features[i].partial = flatten(features[i].partial).reduce((prev, current, index, array) => {
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


			            }
			            return features;
				    }

				    let data = {};
				    const features = transformBrowserVersion(usageData.features);
				    data.elementCollection = map(features, (value, prop) => {
			            let feature = value;
			            feature.count = usageData.counts[feature.feature];
			            feature.name = feature.feature;
			            feature.title = feature.title;
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
