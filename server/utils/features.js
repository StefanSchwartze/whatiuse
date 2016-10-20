const prune = require('./prune');
const getCss = require('get-css');
const unique = require('./unique');
const next = require('next-stream');
const limitstream = require('./limit');
const doiuse = require('doiuse/stream');
const JSONStream = require('JSONStream');
const agents = require('./user-agents').agents;
const fromString = require('from2-string');
const pipe = require('mississippi').pipe;
const concat = require('mississippi').concat;
const through = require('mississippi').through;
const caniuseData = require('caniuse-db/fulldata-json/data-1.0').data;

var _ = require('lodash');
// import { values, _.flatten, _.findKey, _.uniq, _.uniqWith, _.find, _.isEqual, _.uniqBy, _.differenceBy, _.findIndex } from "lodash";

var self = module.exports = {

	evaluate: (args) => {

		return new Promise((resolve, reject) => {

			const url = args.url || '';
			const browser = args.browser || '';
			const options = {
				timeout: 10000,
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
							//console.warn(warn);
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
						console.log('I am an error');
						reject(err);
					});
					finalStream.on('end', (err) => {
						
					    const transformBrowserVersion = (features) => {

				            for (var i = 0; i < features.length; i++) {
				            	if(features[i].missing) {
						            features[i].missing = _.flatten(features[i].missing).reduce((prev, current, index, array) => {
						                let nextVersions = typeof current.versions === 'string' ? current.versions.replace(/[()]/g, '').replace(/,\s*$/, "").split(',') : current.versions;
						                if(!(current.browser in prev.keys)) {
						                    prev.keys[current.browser] = index;
						                    prev.result.push({
						                        browser: current.browser.trim(),
						                        versions: nextVersions,
						                        alias: _.findKey(agents, (o) => { return o.browser === current.browser.trim(); })
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
						            features[i].partial = _.flatten(features[i].partial).reduce((prev, current, index, array) => {
						                let nextVersions = typeof current.versions === 'string' ? current.versions.replace(/[()]/g, '').replace(/,\s*$/, "").split(',') : current.versions;
						                if(!(current.browser in prev.keys)) {
						                    prev.keys[current.browser] = index;
						                    prev.result.push({
						                        browser: current.browser.trim(),
						                        versions: nextVersions,
						                        alias: _.findKey(agents, (o) => { return o.browser === current.browser.trim(); })
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
					
					    const features = usageData.features ? transformBrowserVersion(usageData.features) : [];
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
				        data.syntaxErrors = usageData.errors || [];

						resolve(data);
					});
				    
				})
			  	.catch(error => {
			  		//console.log('ERRRRROORR!!!');
			    	console.error(error);
			    	reject(error);
			    });

		});
	},
	sumObjectArrayByProp: (array, reduceProp, unifyingProps) => { 

		return _.values(array.reduce((prev, current, index, array) => {
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
                browsers.push.apply(browsers, _.flatten(features[i][type]));
        	}
        }
        return _.values(browsers.reduce((prev, current, index, array) => {
            if(!(current.alias in prev.result)) {
                prev.result[current.alias] = current;
            } 
           else if(prev.result[current.alias]) {
                prev.result[current.alias].versions = _.uniq(prev.result[current.alias].versions.concat(current.versions));
                prev.result[current.alias].version_usage = _.uniqWith(_.flatten([prev.result[current.alias].version_usage, current.version_usage]), _.isEqual);
            }
           return prev;
        },{result: {}}).result);
    },
    getPercentage: (browserset, browsersWithPercentages) => {
        let sum = 0;
        browserset.forEach((browser, key) => {
            browser.versions.forEach((value, key) => {
                let obje = _.find(browsersWithPercentages, (o) => {
                    return (o.alias === browser.alias); 
                });
                if(obje) {
                	let val = _.find(obje.version_usage, (o) => {
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
    		let percBrowser = _.find(browsersWithPercentages, (item) => {
                return item.alias === browser.alias; 
            });
            let version_usage = [];
            for (var i = 0; i < browser.versions.length; i++) {
            	const version = _.find(percBrowser.version_usage, (item) => {
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
    getPercentageSum: (browsers) => {
        let sum = 0;
        browsers.forEach((browser, key) => {
            sum += browser.version_usage.reduce((prev, current, index) => {
            	return prev + browser.version_usage[index].usage;
            }, 0);
        })
        return sum;
    },
    enrichElementWithBrowserData: (elements, browsers) => {
    	const enrichedElements = [];
    	for (var i = 0; i < elements.length; i++) {
			let element = elements[i];
			let messages = [];

			if(element.missing) {
				let missing = self.sumObjectArrayByProp(element.missing, 'alias', ['versions']);
				messages.push('not supported by: ' + missing.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
				element.missing = self.addVersionUsage(missing, browsers);
				element.impactMissing = (self.getPercentageSum(element.missing)).toFixed(2);
			}
			if(element.partial) {
				let partial = self.sumObjectArrayByProp(element.partial, 'alias', ['versions']);
				messages.push('only partially supported by: ' + partial.map((browser) => { return  ' ' + browser.browser + ' (' + browser.versions.join(', ') + ')'}));
				element.partial = self.addVersionUsage(partial, browsers);
				element.impactPartial = (self.getPercentageSum(element.partial)).toFixed(2);
			}
			element.message = element.title + ' ' + messages.join(' and ');
			enrichedElements.push(element);
		}
		return enrichedElements;
    },
    sumData: (data, browserCollection) => {

    	const browsers = browserCollection;
    	let elementCollection = [];
		let allSyntaxErrors = [];

		for (var i = 0; i < data.length; i++) {
			elementCollection.push.apply(elementCollection, data[i].elementCollection);
			allSyntaxErrors.push(data[i].syntaxErrors);
		}
		const uniqueSyntaxErrors = _.uniqBy(_.flatten(allSyntaxErrors), 'message');
		const elements = self.enrichElementWithBrowserData(self.sumObjectArrayByProp(elementCollection, 'feature', ['missing', 'partial']), browsers);

    	return {
    		syntaxErrors: uniqueSyntaxErrors,
    		elementCollection: elements
    	}
    },
    getWhatIfIUseElements: (elements, partialBrowsers, missingBrowsers) => {
    	let whatIfIUseElements = [];
		const keys = Object.keys(caniuseData);
		for (var i = 0; i < keys.length; i++) {
			if((caniuseData[keys[i]].categories.indexOf('CSS') >= 0 || 
				caniuseData[keys[i]].categories.indexOf('CSS3') >= 0) &&
				_.findIndex(elements, (element) => { return element.title === caniuseData[keys[i]].title}) < 0) {
				const pushableElement = self.whatIfIUse(caniuseData[keys[i]], partialBrowsers, missingBrowsers);
				whatIfIUseElements.push(pushableElement);
			}
		}
		return whatIfIUseElements;
    },
    whatIfIUse: (rawElement, partialComparableBrowsers = [], missingComparableBrowsers = []) => {
		let missing = 0;
		let partial = 0;

		for (let i = 0; i < partialComparableBrowsers.length; i++) {
			const currBrowser = partialComparableBrowsers[i];
			if(rawElement.stats[currBrowser.alias]) {
				for (let j = 0; j < currBrowser.version_usage.length; j++) {
					if(rawElement.stats[currBrowser.alias][currBrowser.version_usage[j].version]) {
						const support = rawElement.stats[currBrowser.alias][currBrowser.version_usage[j].version];
						if(support.indexOf('a') >= 0) {
							partial += currBrowser.version_usage[j].usage;
						}
					}
				}

			}
		}

		for (let i = 0; i < partialComparableBrowsers.length; i++) {
			const currBrowser = partialComparableBrowsers[i];
			if(rawElement.stats[currBrowser.alias]) {
				for (let j = 0; j < currBrowser.version_usage.length; j++) {
					if(rawElement.stats[currBrowser.alias][currBrowser.version_usage[j].version]) {
						const support = rawElement.stats[currBrowser.alias][currBrowser.version_usage[j].version];
						if((support.indexOf('y') === -1) && (support.indexOf('a') === -1)) {
							missing += currBrowser.version_usage[j].usage;
						}
					}
				}
			}
		}

		return {
			name: rawElement.title,
			missing: missing,
			partial: partial
		}
	},
	getCheckableBrowsers: (alreadyCheckedBrowsers, allBrowsers) => {
		return _.values(allBrowsers.reduce( (prev, current, index, array) => {
			const browsersWithSameName = alreadyCheckedBrowsers.filter(browser => browser.alias === current.alias);
			if(browsersWithSameName.length > 0) {
				const allVersionUsage = browsersWithSameName.length > 1 ?
					_.flatten([browsersWithSameName[0].version_usage, browsersWithSameName[1].version_usage]) :
					browsersWithSameName[0].version_usage;
				const version_usage = _.differenceBy(current.version_usage, allVersionUsage, 'version');
				if(version_usage.length > 0) {
					prev.result[current.alias] = {
						browser: current.browser,
						alias: current.alias,
						version_usage: version_usage
					};
				}
			} else {
				prev.result[current.alias] = current;
			}
			return prev;
		},{result: {}}).result);
	},
    getBrowserVersionShare: (collection) => {
		let shortBrowsers = [];
		for (var i = 0; i < collection.length; i++) {
			const browser = collection[i];
			for (var j = 0; j < browser.version_usage.length; j++) {
				const currVersion = browser.version_usage[j];
				shortBrowsers.push({
					"nameVersion": browser.alias+currVersion.version,
					"share": currVersion.usage
				});
			}
		}
		return shortBrowsers;
	},
	getShortBrowsersWithUsage: (collection) => {
		let shortBrowsers = [];
		for (var i = 0; i < collection.length; i++) {
			const browser = collection[i];
			for (var j = 0; j < browser.version_usage.length; j++) {
				shortBrowsers.push({
					alias: browser.alias,
					version: browser.version_usage[j].version,
					usage: browser.version_usage[j].usage
				});
			}
		}
		return shortBrowsers;
	}
}
