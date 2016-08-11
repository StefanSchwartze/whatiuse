// forked from @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/app/utils/store-utils.js
export default {
  findItemById: function(collection, id) {
    return collection.find(x => x._id === id);
  },
  findIndexById: function(collection, id) {
    var index;
    collection.find((x, i) => {
      index = i;
      return x._id === id;
    });
    return index;
  },
  findItemByTitleAndUrl: function(collection, title, url) {
    return collection.find(x => x.title === title && x.url === url);
  },
  constructBrowserArray: function(browsers) {
    return browsers.map((browser) => {
      browser.version_usage = Object.keys(browser.version_usage).map(version => {
        return {
          version: version,
          usage: browser.version_usage[version]
        }
      });
      return browser;
    });
  },
  deconstructBrowserArray: function(browsers) {
    return browsers.map((browser) => {
      const versions = browser.version_usage;
      browser.version_usage = {};
      for (var i = 0; i < versions.length; i++) {
        const version = versions[i];
        browser.version_usage[version.version] = version.usage
      }
      return browser;
    });
  },
};
