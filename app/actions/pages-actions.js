import alt from 'utils/alt';
import api from 'utils/api';
import {clone, assign, map, flatten, findKey, forEach, find} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById, findItemByTitleAndUrl} from 'utils/store-utils';
import {agents} from 'utils/user-agents';

import axios from 'axios';
import StatusActions from 'actions/status-actions';

class PagesActions {
    constructor() {
        this.generateActions('removeCurrent', 'selectPage', 'checking', 'checked');
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
    checkURL(page) {

        return async (dispatch) => {
    
            StatusActions.started();
            this.checking(page._id);

            try {
                const store = alt.stores.BrowsersStore.state;
                const scope = store.currentScope;
                const browsers = store.browserscopes[scope].browsers;
                const response = await axios.post('/check', { url: page.url, browsers: browsers });
                const snapshot = {
                    pageSupport: response.data.pageSupport,
                    elementCollection: response.data.elementCollection, 
                    browserCollection: browsers,
                    scope: scope
                }

                page.snapshots.push(snapshot);
                page.latestSupport = response.data.pageSupport;
                this.update(page._id, page);

                dispatch({ok: true, id: page._id, data: snapshot});
            } catch (err) {
                console.error(err);
                dispatch({ok: false, error: err.data});
            }

            this.checked(page._id);
            StatusActions.done();

        }

    }
}

module.exports = (alt.createActions(PagesActions));