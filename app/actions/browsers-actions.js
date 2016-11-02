import alt from 'utils/alt';
import axios from 'axios';
import {clone} from 'lodash';
import api from 'utils/api';
import {findItemById} from 'utils/store-utils';
import {networkAction} from 'utils/action-utils';
import StatusActions from './status-actions';
import ProjectsActions from './projects-actions';
import ProjectsStore from '../stores/projects-store';

class BrowsersActions {
    constructor() {
    }
    update(type, browsers) {
        return { browsers: browsers, type: type };
    }
    add(browserCollection) {
        var browserset = browserCollection;
        return async (dispatch) => {
            const browsers = clone(browserset);
            networkAction('Browsers', dispatch, this, api.browsers.post, {browsers: browsers});
        }
    }
    fetch(scope, projectId) {
        return async (dispatch) => {
            switch(scope) {
                case 'global':
                    this.fetchGlobal();
                    break;
                case 'custom':
                    this.fetchCustom(projectId);
                    break;
                case 'fdx':
                    this.fetchFdx(projectId);
                    break;
            }
        }
    }
    fetchGlobal() {
        return async (dispatch) => {
            networkAction('Browsers', dispatch, this, api.browsers.getAll);
        }
    }
    fetchCustom(id) {
        return async (dispatch) => {
            networkAction('Browsers', dispatch, this, api.projects.get, id);
        }
    }
    fetchFdx(id) {
        return async (dispatch) => {
            networkAction('Browsers', dispatch, this, api.projects.get, id);
        }
    }
    selectScope(scope) {
        return scope;
    }
    validateBrowserset(browsers) {

        return async (dispatch) => {
    
            StatusActions.started();

            try {
                const response = await axios.post('/browsers/validate', { browsers: browsers });
                const projectStore = ProjectsStore.getState();
                let project = findItemById(projectStore.projects, projectStore.currentProjectId);
                project.browserscopes.fdx = response.data.browsers || {};
                ProjectsActions.update(project._id, project);
                dispatch({ok: true, data: response.data.browsers });
            } catch (err) {
                console.error(err);
                dispatch({ok: false, error: err.data});
            }

            StatusActions.done();

        };

    }
}

module.exports = (alt.createActions(BrowsersActions));
