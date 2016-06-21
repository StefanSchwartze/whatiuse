import {clone, assign, map, flatten, findKey, forEach, find, head} from 'lodash';
import { agents } from 'caniuse-db/data';

module.exports = (browsers) => {

	return new Promise((resolve, reject) => {

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

		if(head(browsers).count >= 1 || head(browsers).share >= 1) {
			browsers = calculateShares(browsers);
		}

		for (var i = 0; i < browsers.length; i++) {
			const name = getNormalizedBrowserName(browsers[i]);
			const version = name ? getNormalizedVersion(name, browsers[i].version) : false;
			if(name && version) {
				const browser = {
					name: name,
					version: version.origin,
					share: browsers[i].share
				}
				validBrowsersList.push(browser);
			} else {
				unknownBrowsersList.push(browsers[i]);
			}
		}

		//reject(err);
		let data = {
			validBrowsers: validBrowsersList,
			unvalidBrowsers: unknownBrowsersList
		}
		resolve(data);

	});
}
