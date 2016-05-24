import alt from 'utils/alt';
import api from 'utils/api';
import {clone, assign, map, flatten, findKey, forEach, find} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById} from 'utils/store-utils';
import {agents} from 'utils/user-agents';

import axios from 'axios';
import StatusActions from 'actions/status-actions';

class PagesActions {
    constructor() {
        this.generateActions('removeCurrent', 'selectPage');
    }
    fetch() {
        networkAction(this, api.pages.getAll);
    }
    get(id) {
        networkAction(this, api.pages.get, id);
    }
    add(data) {
        networkAction(this, api.pages.post, clone(data));
    }
    update(id, data) {
        networkAction(this, api.pages.put, id, clone(data));
    }
    delete(id) {
        networkAction(this, api.pages.delete, id);
    }
    checking(id) {
        this.dispatch(id);
    }
    checked(id) {
        this.dispatch(id);
    }
    async checkURL(page) {
        console.log('called checkURL');
        StatusActions.started();
        this.actions.checking(page._id);

        try {
            let browsers = this.alt.stores.BrowsersStore.state.browsers.global;
            let browserArr = [];

            for (var i = 0; i < browsers.length; i++) {
                browserArr.push(browsers[i].name);
            }

            const response = await axios.post('/check', { url: page.url, browsers: browserArr });
        
            function getMissingBrowserVersions(feature) {
                let browsers = [];

                for (var i = 0; i < feature.length; i++) {
                    browsers.push(feature[i].missing);
                }

                return flatten(browsers).reduce(function(prev, current, index, array){
                    let nextVersions = current.versions.replace(/[()]/g, '').replace(/,\s*$/, "").split(',');
                    if(!(current.browser in prev.keys)) {
                        prev.keys[current.browser] = index;
                        prev.result.push({
                            browser: current.browser.trim(),
                            versions: nextVersions,
                            alias: findKey(agents, function(o) { return o.browser === current.browser.trim(); })
                        });
                    } 
                   else {
                        if(prev.result[prev.keys[current.browser]]) {
                            prev.result[prev.keys[current.browser]].versions.concat(nextVersions);
                        } else {
                            prev.result[prev.result.length - 1].versions.concat(nextVersions);
                        }
                   }  

                   return prev;
                },{result: [], keys: {}}).result;
            }

            function getPercentage(browserset, browsersWithPercentages) {
                let sum = 0;

                forEach(browserset, function(browser, key) {
                    forEach(browser.versions, function(value, key) {
                        let obje = find(browsersWithPercentages, function(o) {
                            return o.name === browser.alias + ' ' + value; 
                        });
                        sum += obje.share;
                    })
                })

                return sum;
            }

            let features = response.data[0].usages;
            let counts = response.data[0].counts;
            var elementCollection = map(features, function(value, prop) {
                let feature = value;
                feature.count = counts[feature.feature];
                feature.name = feature.feature;
                feature.impact = getPercentage(getMissingBrowserVersions([feature]), browsers);
                feature.message = feature.message;
                return feature;
            });

            page.snapshots.push({
                pageSupport: 100 - getPercentage(getMissingBrowserVersions(features), browsers),
                elementCollection: elementCollection, 
                browserCollection: browsers
            });
            const update = this.actions.update(page._id, page);

            this.dispatch({ok: true, id: page._id, data: response.data});
        } catch (err) {
            console.error(err);
            this.dispatch({ok: false, error: err.data});
        }

        this.actions.checked(page._id);
        StatusActions.done();
    }
}

module.exports = (alt.createActions(PagesActions));
