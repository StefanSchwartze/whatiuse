import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';

class SnapshotsActions {
    constructor() {
    }
    fetch() {
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.getAll);
        }
    }
    get(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.get, id);
        }
    }
    getByPageId(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.getAll, { page: id });
        }
    }
    add(data) {
        console.log(data);
        return async (dispatch) => {
            networkAction(dispatch, this, api.snapshots.post, clone(data));
        }
    }
}

module.exports = (alt.createActions(SnapshotsActions));