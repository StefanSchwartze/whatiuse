

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
			}