import { forEach, head, values } from 'lodash';
import { agents } from 'caniuse-db/data';

module.exports = (browsers) => {

	let unknownBrowsersList = [];
	let validBrowsersList = [];
	let botsList = [];
	let aliases = {
		"apple mobile safari" : 'ios_saf',
		"mobile safari" : 'ios_saf',
		"ios safari" : 'ios_saf',
		"ios" : 'ios_saf',
		"apple safari" : 'safari',
		"safari" : 'safari',
		"opera" : "opera",
		"opera mobile" : "op_mob",
		"opera mini" : "op_mini",
		"firefox" : "firefox",
		"mozilla firefox" : "firefox",
		"internet explorer" : "ie",
		"microsoft internet explorer" : "ie",
		"microsoft edge" : "edge",
		"chrome" : "chrome",
		"google chrome" : "chrome",
		"google chrome for android" : "and_chr",
		"firefox for android" : "and_ff",
		"firefox mobile" : "and_ff",
		"open handset alliance android built-in" : "android",
		"uc browser for android" : "and_uc",
		"blackberry browser" : "bb"
	}
	const bots = ["bot", "spider", "phantomjs", "scraper", "crawler", "scrapy"];

	const isBot = (botArray, browser) => {
		const name = browser.name.toLowerCase();
		let i = 0;
		let isBot = false;
		while (i < botArray.length && !isBot) {
			isBot = name.indexOf(botArray[i]) >= 0;
			i++;			
		}
		return isBot;
	}

	const calculateUsages = (browsers) => {

		let numberOfBrowsers = 0;
		forEach(browsers, (browser) => {
			numberOfBrowsers += (parseInt(browser.count) || 0);
		});

		return browsers.map((browser) => {
			const browserN = browser;
			browserN.usage = browser.count / numberOfBrowsers * 100;
			return browserN;
		});

	};

	const getNormalizedBrowserName = (browser) => {
		const name = browser.name.toLowerCase();
		const alias = aliases[name];
		return alias || false;
	}

	const getNormalizedVersion = (browser, version) => {

		const getAllValidVersionsFromBrowser = (browser) => {
			const validVersions = Object.keys(agents[browser].usage_global);
			let versions = {};

			forEach(validVersions, (version) => {
				const minusIndex = version.indexOf("-");
				if(minusIndex > -1) {
					const versionRangeStart = parseInt(version.substring(version.indexOf('.') + 1, minusIndex));
					const versionRangeEnd = parseInt(version.substring(version.lastIndexOf('.') + 1, version.length));
					const totalNumberOfVersions = versionRangeEnd - versionRangeStart;
					const mainVersionNumber = version.substring(0, version.indexOf('.'));

					for (var i = 0; i <= totalNumberOfVersions; i++) {
						const subVersion = versionRangeStart + i;
						const pushableVersion = mainVersionNumber + "." + subVersion;
						versions[pushableVersion] = {
							origin: version
						};
					}
				}
				versions[version] = {
					origin: version
				};
			});
			return versions;
		}

		const getVersion = (version, versions) => {

			if(!((Object.keys(versions)).indexOf(version) > -1)) {
				if((version.split(".")).length < 2) {
					return false;
				} else {
					return getVersion(version.replace(/.[^.]+$/, ""), versions);	
				}
			} 
			return versions[version];
		}

		return getVersion(version, getAllValidVersionsFromBrowser(browser));
	}

	const sumByNameAndVersion = (browsers) => {
		return values(browsers.reduce(function(prev, current, index, array){
			const identifier = current.alias + current.version;
			if(!(identifier in prev.result)) {
				prev.result[identifier] = current;  
			} 
			else if(prev.result[identifier]) {
				prev.result[identifier].usage += current.usage;
			}  

		   return prev;
		},{result: {}}).result);
	}

	const completeBrowserData = (browsers) => {
		return values(browsers.reduce(function(prev, current, index, array){
			const identifier = current.alias;
			if(!(identifier in prev.result)) {
				prev.result[identifier] = {
					alias: identifier,
					browser: agents[identifier].browser,
					version_usage: [{
						version: current.version,
						usage: current.usage
					}]
				};  
			} 
			else if(prev.result[identifier]) {
				prev.result[identifier].version_usage.push({
					version: current.version,
					usage: current.usage
				});
			}  
		   return prev;
		},{result: {}}).result);
	}

	if(head(browsers).count >= 1 || head(browsers).usage >= 1) {
		browsers = calculateUsages(browsers);
	}

	for (var i = 0; i < browsers.length; i++) {
		const name = getNormalizedBrowserName(browsers[i]);
		const version = name ? getNormalizedVersion(name, browsers[i].version) : false;
		if(name && version) {
			const browser = {
				alias: name,
				version: version.origin,
				usage: browsers[i].usage
			}
			validBrowsersList.push(browser);
		} else if(isBot(bots, browsers[i])) {
			botsList.push(browsers[i]);
		} else {
			unknownBrowsersList.push(browsers[i]);
		}
	}
	const summedBrowsers = sumByNameAndVersion(validBrowsersList);
	const cleanBrowserList = completeBrowserData(summedBrowsers);

	let data = {
		browsers: cleanBrowserList,
		unknown: sumByNameAndVersion(unknownBrowsersList),
		bots: sumByNameAndVersion(botsList)
	}
	return data;
}
