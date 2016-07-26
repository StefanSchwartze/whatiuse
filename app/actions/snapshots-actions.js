import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {constructBrowserArray} from 'utils/store-utils';

class SnapshotsActions {
    constructor() {
    }
    fetch(params) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.getAll, params);
        }
    }
    get(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.get, id);
        }
    }
    add(data) {
        const browsers = constructBrowserArray(clone(data.browserCollection));
        data.browserCollection = browsers;
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.post, clone(data));
        }
    }
}

module.exports = (alt.createActions(SnapshotsActions));