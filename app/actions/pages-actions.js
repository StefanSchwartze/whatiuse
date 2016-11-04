import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById, findItemByTitleAndUrl} from 'utils/store-utils';
import BrowsersStore from 'stores/browsers-store';

import axios from 'axios';
import StatusActions from 'actions/status-actions';
import SnapshotsActions from 'actions/snapshots-actions';
let socket;

if(!process.env.BROWSER) {
    socket = require('socket.io-client')('http://localhost');
} else {
    socket = io();
}

class PagesActions {
    constructor() {
        this.generateActions('removeCurrent', 'selectPage', 'checking', 'checked', 'progress', 'fetching');
    }
    fetch(params) {
        return async (dispatch) => {
            networkAction('Pages', dispatch, this, api.pages.getAll, params);
        }
    }
    get(id) {
        return async (dispatch) => {
            networkAction('Pages', dispatch, this, api.pages.get, id);
        }
    }
    add(data) {
        return async (dispatch) => {
            this.createBackground(data.url, data.title);
            networkAction('Pages', dispatch, this, api.pages.post, clone(data));
        }
    }
    update(id, data) {
        return async (dispatch) => {
            networkAction('Pages', dispatch, this, api.pages.put, id, clone(data));
        }
    }
    delete(id) {
        return async (dispatch) => {
            networkAction('Pages', dispatch, this, api.pages.delete, id);
        }
    }
    createBackground(url, title) {
        return async () => {
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

            const store = BrowsersStore.getState();
            const scope = store.currentScope;
            const browsers = clone(store.browserscopes[scope].browsers);

            socket.emit('triggerURL', { url: page.url, browsers: browsers, id: page._id, page: page, scope: scope }, 
                function (err) {
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
    cancelCheck(id) {
        socket.emit('cancelCheck', { id: id });
        return id;
    }
    checkComplete(snapshot) {
        const store = BrowsersStore.getState();
        const scope = store.currentScope;
        snapshot.scope = scope || 'global';
        SnapshotsActions.save(snapshot);
        StatusActions.done();
        this.checked(snapshot.pageId);
        let page = findItemById(alt.stores.PagesStore.state.pages, snapshot.pageId);
        page[scope + 'Support'] = snapshot.pageSupport;
        return page;
    }
    checkFailed(id) {
        this.checked(id);
        StatusActions.done();
        return id;
    }
}

module.exports = (alt.createActions(PagesActions));