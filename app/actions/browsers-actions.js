import alt from 'utils/alt';
import axios from 'axios';
import {findItemById} from 'utils/store-utils';
import StatusActions from './status-actions';
import ProjectsActions from './projects-actions';

class BrowsersActions {
    constructor() {
    }
    update(type, browsers) {
        return { browsers: browsers, type: type };
    }
    fetchConfig() {
        const projectStore = alt.stores.ProjectsStore.state;
        const project = findItemById(projectStore.projects, projectStore.currentProjectId);
        return project.browserscopes.config;
    }
    fetchCustom() {
        const projectStore = alt.stores.ProjectsStore.state;
        const project = findItemById(projectStore.projects, projectStore.currentProjectId);
        return project.browserscopes.fdx;
    }
    selectScope(scope) {
        this.fetchCustom();
        this.fetchConfig();
        return scope;
    }
    validateBrowserset(browsers) {

        return async (dispatch) => {
    
            StatusActions.started();

            try {
                const response = await axios.post('/browsers/validate', { browsers: browsers });
                const projectStore = alt.stores.ProjectsStore.state;
                let project = findItemById(projectStore.projects, projectStore.currentProjectId);
                project.browserscopes.fdx = response.data.browsers;
                ProjectsActions.update(projectStore.currentProjectId, project);
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
