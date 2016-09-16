import { forEach, head, values } from 'lodash';
import { agents } from 'caniuse-db/data';

module.exports = (browsers) => {

	let unknownBrowsersList = [];
	let validBrowsersList = [];
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

	const calculateShares = (browsers) => {

		let numberOfBrowsers = 0;
		forEach(browsers, (browser) => {
			let val = browser.count;
			numberOfBrowsers += val;
		});

		return browsers.map((browser) => {
			let browserN = browser;
			browserN.share = browserN.count / numberOfBrowsers;
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
				let minusIndex = version.indexOf("-");
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
				prev.result[identifier].share += current.share;
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
					completeShare: current.share,
					version_usage: [{
						version: current.version,
						share: current.share
					}]
				};  
			} 
			else if(prev.result[identifier]) {
				prev.result[identifier].completeShare += parseFloat(current.share);
				prev.result[identifier].version_usage.push({
					version: current.version,
					share: current.share
				});
			}  
		   return prev;
		},{result: {}}).result);
	}

	if(head(browsers).count >= 1 || head(browsers).share >= 1) {
		browsers = calculateShares(browsers);
	}

	for (var i = 0; i < browsers.length; i++) {
		const name = getNormalizedBrowserName(browsers[i]);
		const version = name ? getNormalizedVersion(name, browsers[i].version) : false;
		if(name && version) {
			const browser = {
				alias: name,
				version: version.origin,
				share: browsers[i].share
			}
			validBrowsersList.push(browser);
		} else {
			unknownBrowsersList.push(browsers[i]);
		}
	}
	const summedBrowsers = sumByNameAndVersion(validBrowsersList);
	const cleanBrowserList = completeBrowserData(summedBrowsers);

	let data = {
		browsers: cleanBrowserList,
		unknown: sumByNameAndVersion(unknownBrowsersList)
	}
	return data;
}
