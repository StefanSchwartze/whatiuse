import alt from 'utils/alt';
import api from 'utils/api';
import {clone, assign, map, flatten, findKey, forEach, find} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById, findItemByTitleAndUrl} from 'utils/store-utils';
import {agents} from 'utils/user-agents';

import axios from 'axios';
import StatusActions from 'actions/status-actions';

if(!process.env.BROWSER) {
    var socket = require('socket.io-client')('http://localhost');
} else {
    var socket = io();
}

class PagesActions {
    constructor() {
        this.generateActions('removeCurrent', 'selectPage', 'checking', 'checked', 'progress');
    }
    fetch() {
        return async (dispatch) => {
            networkAction(dispatch, this, api.pages.getAll);
        }
    }
    get(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.pages.get, id);
        }
    }
    add(data) {
        return async (dispatch) => {
            this.createBackground(data.url, data.title);
            networkAction(dispatch, this, api.pages.post, clone(data));
        }
    }
    update(id, data) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.pages.put, id, clone(data));
        }
    }
    delete(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.pages.delete, id);
        }
    }
    createBackground(url, title) {
        return async (dispatch) => {
            const response = await axios.post('/image', { url: url, title: title });
            let page = findItemByTitleAndUrl(alt.stores.PagesStore.state.pages, title, url);
            page.imgSrc = response.data.imgSrc;
            this.update(page._id, page);
        }
    }
    triggerURLCheck(page) {
        return async (dispatch) => {
            StatusActions.started();
            this.checking(page._id);

            const store = alt.stores.BrowsersStore.state;
            const scope = store.currentScope;
            const browsers = store.browserscopes[scope].browsers;

            socket.emit('triggerURL', { url: page.url, browsers: browsers, id: page._id }, function (err) {
                    if (err) {
                        console.error('Error deleting user:', err);
                        dispatch({ok: false, err: err});
                    } else {
                        dispatch({ok: true, id: page._id});
                    }
                }.bind(this)
            );
        }
    }
    checkComplete(snapshot) {
        this.checked(snapshot.pageId);
        let page = findItemById(alt.stores.PagesStore.state.pages, snapshot.pageId)
        page.snapshots.push(snapshot);
        page.latestSupport = snapshot.pageSupport;
        this.update(snapshot.pageId, page);
        return {ok: true, id: page._id, data: snapshot};
    }
}

module.exports = (alt.createActions(PagesActions));