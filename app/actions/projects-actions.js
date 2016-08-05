import alt from 'utils/alt';
import api from 'utils/api';
import {clone} from 'lodash';
import {networkAction} from 'utils/action-utils';

class ProjectsActions {
    constructor() {
        this.generateActions('removeCurrent');
    }
    fetch() {
        return async (dispatch, alt) => {
            alt.resolve(async () => {
                try {
                    await networkAction(dispatch, this, api.projects.getAll);
                } catch (error) {
                    console.log(error);
                }
            })
        }
    }/*
    get(id) {
        return async (dispatch, alt) => {
            alt.resolve(async () => {
                await networkAction(dispatch, this, api.projects.get, id);
            })
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
    }*/
}

module.exports = {
    default: (alt.createActions(ProjectsActions)),
    raw: ProjectsActions
}