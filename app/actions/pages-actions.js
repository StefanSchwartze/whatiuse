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
    async checkURL(id, url) {
        StatusActions.started();

        try {
            const response = await axios.post('/check', { url: url });

            let page = findItemById(this.alt.stores.PagesStore.state.pages, id);
            let features = response.data[0].counts;
            var elementCollection = map(features, function(value, prop) {
                return { name: prop, count: value };
            });

            page.elementsCollections.push({elementCollection});
            const update = this.actions.update(id, page);

            this.dispatch({ok: true, id: id, data: response.data});
        } catch (err) {
            console.error(err);
            this.dispatch({ok: false, error: err.data});
        }

        StatusActions.done();

    }
}

module.exports = (alt.createActions(PagesActions));
