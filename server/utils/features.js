import prune from './prune';
import getCss from 'get-css';
import unique from './unique';
import next from 'next-stream';
import limitstream from './limit';
import doiuse from 'doiuse/stream';
import JSONStream from 'JSONStream';
import {agents} from './user-agents';
import fromString from 'from2-string';
import { pipe, through, concat } from 'mississippi';
import { values, flatten, findKey, uniq, forEach, find } from 'lodash';

export default {

	evaluate: (args) => {

		return new Promise((resolve, reject) => {

			const url = args.url || '';
			const browser = args.browser || '';
			const options = {
				timeout: 5000,
				headers: { 
					'User-Agent': browser 
				}
			};
			// forked from @anandthakker
			// initial source: https://github.com/anandthakker/doiuse.com/blob/master/lib/css-features.js
			getCss(args.url, options)
				.then((response) => {

					let streams = [fromString(response.css)];
					let errorsAndWarnings = [];
					let uniqe = unique();
					let limit = limitstream(1e6);
					let features = prune();


					streams = streams.concat([
						limit,
						doiuse({ browsers: browser, skipErrors: true }, url.trim().length ? url : 'pasted content')
						.on('warning',  (warn) => {
							console.log(warn);
							errorsAndWarnings.push(warn);
						}),
						uniqe.features,
						features
					]);
					let stringify = features.pipe(JSONStream.stringify());
					let error = through();

					pipe(streams,
						 (err) => {
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
					    data.elementCollection = features.map((value, prop) => {
				            let feature = {};
				            if(value.partial) {
				            	feature.partial = value.partial;
				            	feature.impactPartial = value.impactPartial;
				            }
				            if(value.missing) {
				            	feature.missing = value.missing;
				            	feature.impactMissing = value.impactMissing;
				            }
				            feature.feature = value.feature;
				            feature.count = usageData.counts[feature.feature];
				            feature.name = value.feature;
				            feature.title = value.title;
				            return feature;
				        });

						resolve(data);
					});
				    
				})
			  	.catch((error) => {
			    	console.error(error);
			    	reject(error);
			    });

		});
	},
	sumObjectArrayByProp: (array, reduceProp, unifyingProps) => { 

		return values(array.reduce((prev, current, index, array) => {
			if(!(current[reduceProp] in prev.result)) {
                prev.result[current[reduceProp]] = current;
            }
			else if(prev.result[current[reduceProp]]) {

				for (var i = 0; i < unifyingProps.length; i++) {
					const currProp = unifyingProps[i];
					const additionalElementsOfProp = current[currProp];

					if(additionalElementsOfProp) {
					
						const additionalElements = current[currProp];

						if(prev.result[current[reduceProp]][currProp]) {
							if(typeof additionalElements === 'string') {
								prev.result[current[reduceProp]][currProp] += ('\n' + additionalElements);
							} else {
								for (var j = 0; j < additionalElements.length; j++) {
									if(prev.result[current[reduceProp]][currProp].indexOf(additionalElements[j]) < 0) {
										prev.result[current[reduceProp]][currProp].push(additionalElements[j]);
									}
								}
							}
						} else {
							prev.result[current[reduceProp]][currProp] = additionalElements;
						}
					}

				}

			}
           return prev;
        },{result: {}}).result);
	},
	getMissingBrowserVersions: (features, type) => { 
        let browsers = [];

        for (var i = 0; i < features.length; i++) {
        	if(features[i][type]) {
                browsers.push.apply(browsers, flatten(features[i][type]));
        	}
        }
        return values(browsers.reduce((prev, current, index, array) => {
            if(!(current.alias in prev.result)) {
                prev.result[current.alias] = current;
            } 
           else if(prev.result[current.alias]) {
                prev.result[current.alias].versions = uniq(prev.result[current.alias].versions.concat(current.versions));
            }
           return prev;
        },{result: {}}).result);
    },
    getPercentage: (browserset, browsersWithPercentages) => {
        let sum = 0;
        forEach(browserset, (browser, key) => {
            forEach(browser.versions, (value, key) => {
                let obje = find(browsersWithPercentages, (o) => {
                    return (o.alias === browser.alias); 
                });
                if(obje) {
                	let val = find(obje.version_usage, (o) => {
	                    return (o.version === value); 
	                });
                	sum += parseFloat(val.usage);	
            	}
            })
        })

        return sum;
    },
    addVersionUsage: (browsers, browsersWithPercentages) => {
    	return browsers.map((browser) => {
    		let percBrowser = find(browsersWithPercentages, (item) => {
                return item.alias === browser.alias; 
            });
            let version_usage = [];
            for (var i = 0; i < browser.versions.length; i++) {
            	const version = find(percBrowser.version_usage, (item) => {
                    return item.version === browser.versions[i]; 
                });
            	version_usage.push({ version: version.version, usage: version.usage});
            }
    		return {
    			browser: browser.browser,
    			alias: browser.alias,
    			versions: browser.versions,
    			version_usage: version_usage
    		}
    	})
    },
    getPercentageSum: (browser) => {
        let sum = 0;
        forEach(browser, (browser, key) => {
            sum += browser.version_usage.reduce((prev, current, index) => {
            	return prev + browser.version_usage[index].usage;
            }, 0);
        })
        return sum;
    },
    whatIfIDelete: (element) => {
    	return 'You are lucky!';
    }
}
