import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById, findItemByTitleAndUrl} from 'utils/store-utils';
import BrowsersActions from './browsers-actions';

class ProjectsActions {
    constructor() {
        this.generateActions('removeCurrent');
    }
    fetch() {
        return async (dispatch) => {
            networkAction(dispatch, this, api.projects.getAll);
        }
    }
    get(id) {
        return async (dispatch) => {
            console.log(id);
            networkAction(dispatch, this, api.projects.get, id);
        }
    }
    add(data) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.projects.post, clone(data));
        }
    }
    update(id, data) {
        return async (dispatch) => {
            console.log(data);
            //BrowsersActions.update(data, "custom");
            networkAction(dispatch, this, api.projects.put, id, clone(data));
        }
    }
    delete(id) {
        return async (dispatch) => {
            networkAction(dispatch, this, api.projects.delete, id);
        }
    }
}

module.exports = (alt.createActions(ProjectsActions));