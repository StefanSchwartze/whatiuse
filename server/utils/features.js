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
import { data as caniuseData } from "caniuse-db/fulldata-json/data-1.0";
import { values, flatten, findKey, uniq, uniqWith, forEach, find, isEqual, intersectionWith, mergeWith, drop, isArray, uniqBy, xorWith, differenceBy, differenceWith, difference, findIndex } from "lodash";

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
			  	.catch((error) => {
			  		console.log('ERRRRROORR!!!');
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
                prev.result[current.alias].version_usage = uniqWith(flatten([prev.result[current.alias].version_usage, current.version_usage]), isEqual);
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
    sumResults: (data, allbrowsers, pageId, dataScope) => {

    	const browsers = allbrowsers;
    	const id = pageId;
    	const scope = dataScope;
    	let elementCollection = [];
		let allSyntaxErrors = [];
		for (var i = 0; i < data.length; i++) {
			elementCollection.push(data[i].elementCollection);
			allSyntaxErrors.push(data[i].syntaxErrors);
		}
		const uniqueSyntaxErrors = uniqBy(flatten(allSyntaxErrors), 'message');
		let elements = self.sumObjectArrayByProp(flatten(elementCollection), 'feature', ['missing', 'partial']);

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
		}

		for (var k = 0; k < elements.length; k++) {
			let searchElement = elements[k];
/*

			const getAllElementBrowsers = (element) => {
				let allBrowsers = [];
				if(element.partial) {
					let browsers = getShortBrowsers(element.partial);
					allBrowsers.push.apply(allBrowsers, browsers);
					}
				if(element.missing) {
					let browsers = getShortBrowsers(element.missing);
					allBrowsers.push.apply(allBrowsers, browsers);
				}
				return allBrowsers;
			}
			const getShortBrowsers = (collection) => {
				let shortBrowsers = [];
				for (var i = 0; i < collection.length; i++) {
					const browser = collection[i];
					for (var j = 0; j < browser.versions.length; j++) {
						shortBrowsers.push({
							alias: browser.alias,
							version: browser.versions[j]
						});
					}
				}
				return shortBrowsers;
			}
			const elementHasBrowsers = (checkElement, compareBrowsers, excludeElement = {}) => {
				//console.log(excludeElement);
				let exclude = excludeElement.feature ? (excludeElement.feature === checkElement.feature) : false;
				if(!exclude) {
					let checkElemBrowsers = getAllElementBrowsers(checkElement);
					const diff = intersectionWith(checkElemBrowsers, compareBrowsers, isEqual);
					return diff.length > 0;
				}	
				return false;
			}
			const getElementsByBrowsers = (browsers, elementCollection) => {
				return elementCollection
					.filter((element) => {
						const checkElemBrowsers = getAllElementBrowsers(element);
						const diff = intersectionWith(checkElemBrowsers, browsers, isEqual);
						return diff.length > 0;
					})
					.map((elem) => {
						//console.log(elem);
						return elem.feature;
					});
			}
			const getSortedBrowsersByElements = (element, elementCollection) => {

				let allBrowsers = getAllElementBrowsers(element);
				let repeatedlyUsedBrowsers = [];
				let uniqueBrowsers = [];

				for (var i = 0; i < allBrowsers.length; i++) {
					const browser = allBrowsers[i];
					let isUniq = true;
					let j = 0;
					while(j < elementCollection.length && isUniq) {
						const hasBrowser = elementHasBrowsers(elementCollection[j], [browser], element);
						if(hasBrowser) {
							isUniq = false;
						} else {
							j++;
						}
					}
					if(isUniq) {
						uniqueBrowsers.push(browser);
					} else {
						repeatedlyUsedBrowsers.push(browser);
					}
				}
				return {
					uniqueBrowsers: uniqueBrowsers,
					repeatedlyUsedBrowsers: repeatedlyUsedBrowsers
				}
			}
			const getUniqueBrowsersByElements = (searchElements, elementCollection, browserset) => {

				const uniqueBrowsers = browserset.filter((browser) => {
					let isOkay = true;
					let countOfMatchElems = 0;
					let j = 0;
					// check all elements for browser
					while(j < elementCollection.length && isOkay) {

						const currentElement = elementCollection[j];
						const browsersFromElement = getAllElementBrowsers(currentElement);
						const hasBrowser = find(browsersFromElement, (foundBrowser) => { return isEqual(foundBrowser, browser) });
						
						if(hasBrowser) {
							let isOneOf = false;
							// check if matching element is one of the searched ones
							for (var i = 0; i < searchElements.length; i++) {
								//console.log(currentElement);
								if(currentElement.feature === searchElements[i]) {
									countOfMatchElems = countOfMatchElems + 1;
									isOneOf = true;
								}
							}
							if(isOneOf) {
								isOkay = true;
								j++;
							} else {
								isOkay = false;
							}

						} else {
							j++;
						}
					}
					// when browser has not matched in all searched elements, kick browser
					if(countOfMatchElems > searchElements.length) {
						isOkay = false;
					}
					return isOkay;
				});
				return uniqueBrowsers;
			}

			// all browsers of the searched element sorted by group (unique = only used by this element | repeatedly = by more elements used)
			const sortedBrowsers = getSortedBrowsersByElements(searchElement, elements);

			// the unique browsers from element; can directly have impact by removing element
			// all elements that also use the browsers from the searched element
			const commonElements = getElementsByBrowsers(sortedBrowsers.repeatedlyUsedBrowsers, elements.filter((element) => {
				//console.log(element, searchElement);
				return element.feature !== searchElement.feature
			}));
			// check if the repeatedly used browsers from searched element are unique by an element pair
			
			const calcValues = (browsers, browsersWithPercentages) => {
				let sum = 0;
				for (var i = 0; i < browsers.length; i++) {
					const currBrowser = browsers[i];
					let percBrowser = find(browsersWithPercentages, (browser) => {
		                return browser.alias === currBrowser.alias; 
		            });
		            if(percBrowser) {
		            	const version = find(percBrowser.version_usage, (version) => {
			                return version.version === currBrowser.version; 
			            });
			            if(version) {
			            	sum += parseFloat(version.usage);
			            }
		            }
				}
				return sum;
			}

			const isBrowserUniqueInScope = (browser, scope, elementCollection, sourceElement) => {
				let matchCount = 0;
				let j = 0;
				while(j < elementCollection.length && matchCount < 1) {
					let hasBrowser = false;
					if(elementCollection[j].feature !== sourceElement.feature && elementCollection[j][scope]) {
						const diff = intersectionWith(getShortBrowsers(elementCollection[j][scope]), [browser], isEqual);
						hasBrowser = diff.length > 0;
					}
					if(hasBrowser) {
						matchCount += 1;
					}
					j++;
				}
				return matchCount < 1;
			}

			let repeatedlyUsedInPartial = 0;
			let repeatedlyUsedInMissing = 0;

			if(searchElement.partial) {
				repeatedlyUsedInPartial += calcValues(sortedBrowsers.uniqueBrowsers, searchElement.partial);
				
				const browsers = sortedBrowsers.repeatedlyUsedBrowsers;

				for (var i = 0; i < browsers.length; i++) {
					if(isBrowserUniqueInScope(browsers[i], 'partial', elements, searchElement)) {
						repeatedlyUsedInPartial += calcValues([browsers[i]], searchElement.partial);
					}
				}
				
			}
			if(searchElement.missing) {
				repeatedlyUsedInMissing += calcValues(sortedBrowsers.uniqueBrowsers, searchElement.missing);
				
				const browsers = sortedBrowsers.repeatedlyUsedBrowsers;
				
				for (var i = 0; i < browsers.length; i++) {
					if(isBrowserUniqueInScope(browsers[i], 'missing', elements, searchElement)) {
						repeatedlyUsedInMissing += calcValues([browsers[i]], searchElement.missing); 
					}
				}
			}

			const selfDel = {
				partial: repeatedlyUsedInPartial,					
				missing: repeatedlyUsedInMissing
			}

			let othersDel = [];

			for (var i = 0; i < commonElements.length; i++) {

				const fullElem = elements.find(element => element.feature === commonElements[i]);

				let overallset = getAllElementBrowsers(fullElem);
				overallset.push.apply(overallset, sortedBrowsers.repeatedlyUsedBrowsers);

				const uniqueBrowsers = getUniqueBrowsersByElements([searchElement.feature, commonElements[i]], elements, uniqWith(overallset, isEqual));
				if(uniqueBrowsers.length > 0) {
					othersDel.push({
						feature: commonElements[i],
						partial: parseFloat(selfDel.partial) + (fullElem.partial ? calcValues(uniqueBrowsers, fullElem.partial) : 0),
						missing: parseFloat(selfDel.missing) + (fullElem.missing ? calcValues(uniqueBrowsers, fullElem.missing) : 0)
					});
				}
			}
			const deletePossibilities = {
				self: selfDel,
				others: othersDel,
				all: []
			}*/

			const deletePossibilities = {
				self: {
					partial: 0,					
					missing: 0
				},
				others: [],
				all: []
			}

			searchElement.deletePossibilities = deletePossibilities;
		}

		const missingBrowsers = self.getMissingBrowserVersions(elements, 'missing');
		const partialBrowsers = self.getMissingBrowserVersions(elements, 'partial');

		const getCheckableBrowsers = (alreadyCheckedBrowsers, allBrowsers) => {
			return values(allBrowsers.reduce( (prev, current, index, array) => {
				const browsersWithSameName = alreadyCheckedBrowsers.filter(browser => browser.alias === current.alias);
				if(browsersWithSameName.length > 0) {
					const allVersionUsage = browsersWithSameName.length > 1 ?
						flatten([browsersWithSameName[0].version_usage, browsersWithSameName[1].version_usage]) :
						browsersWithSameName[0].version_usage;
					const version_usage = differenceBy(current.version_usage, allVersionUsage, 'version');
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
		}
		const restPartialBrowsers = getCheckableBrowsers(partialBrowsers, browsers);
		const restMissingBrowsers = getCheckableBrowsers(missingBrowsers, browsers);

		const whatIfIUse = (rawElement, partialComparableBrowsers = [], missingComparableBrowsers = []) => {
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
			};
		}
		const getShortBrowsersWithUsage = (collection) => {
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

		let whatIfIUseElements = [];

		const keys = Object.keys(caniuseData);
		for (var i = 0; i < keys.length; i++) {
			if((caniuseData[keys[i]].categories.indexOf('CSS') >= 0 || 
				caniuseData[keys[i]].categories.indexOf('CSS3') >= 0) &&
				findIndex(elements, (element) => { return element.title === caniuseData[keys[i]].title}) < 0) {
				const pushableElement = whatIfIUse(caniuseData[keys[i]], restPartialBrowsers, restMissingBrowsers);
				whatIfIUseElements.push(pushableElement);
			}
		}
		const missingSupport = self.getPercentage(missingBrowsers, browsers);
		let partialSupport = 0;

		const partialRest = differenceWith(getShortBrowsersWithUsage(partialBrowsers), getShortBrowsersWithUsage(missingBrowsers), isEqual);
		for (var i = 0; i < partialRest.length; i++) {
			partialSupport += partialRest[i].usage;
		}

		let send = {
			elementCollection: elements,
			browserCollection: browsers,
			pageSupport: (100 - missingSupport).toFixed(2),
			pageId: id,
			scope: scope,
			whatIfIUse: whatIfIUseElements || [],
			syntaxErrors: uniqueSyntaxErrors,
			missingSupport: missingSupport,
			partialSupport: partialSupport,
			missingBrowsers,
			partialBrowsers
		}

    	return send;
    }
}
