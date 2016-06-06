import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';
import {findItemById, findItemByTitleAndUrl} from 'utils/store-utils';

class ProjectsActions {
    constructor() {
        this.generateActions('removeCurrent');
    }
    fetch() {
        /*
        return async (dispatch) => {
            networkAction(dispatch, this, api.projects.getAll);
        }*/
        return [{
            id: "id4567585676",
            title: "Example project",
            url: "http://example.com",
            settings: {
                browsers: []
            }
        }]
    }
    get(id) {
        return async (dispatch) => {
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