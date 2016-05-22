import alt from 'utils/alt';
import api from 'utils/api';
import {clone, assign, map} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById} from 'utils/store-utils';

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
        StatusActions.started();
        this.actions.checking(page._id);

        try {
            let browsers = this.alt.stores.BrowsersStore.state.browsers.global;
            let browserArr = [];

            for (var i = 0; i < browsers.length; i++) {
                browserArr.push(browsers[i].name);
            }

            const response = await axios.post('/check', { url: page.url, browsers: browserArr });
            
console.log(response.data[0]);

            let features = response.data[0].counts;
            var elementCollection = map(features, function(value, prop) {
                return { name: prop, count: value };
            });
            page.snapshots.push({
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
