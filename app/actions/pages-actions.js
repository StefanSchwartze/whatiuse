import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';

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
    async checkURL(url) {
        StatusActions.started();

        try {
          const response = await axios.post('/check', { url: url });
          this.dispatch({ok: true, data: response.data});
        } catch (err) {
          console.error(err);
          this.dispatch({ok: false, error: err.data});
        }

        StatusActions.done();

    }
}

module.exports = (alt.createActions(PagesActions));
