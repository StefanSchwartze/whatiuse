import alt from 'utils/alt';
import axios from 'axios';
import {findItemById} from 'utils/store-utils';
import StatusActions from 'actions/status-actions';

class BrowsersActions {
    constructor() {
    }
    update(type, browsers) {
    	return { browsers: browsers, type: type };
    }
    fetchConfig() {
    	const projectStore = alt.stores.ProjectsStore.state;
    	const project = findItemById(projectStore.projects, projectStore.currentProjectId);
    	return project.settings.browsers;
    }
    selectScope(scope) {
        return scope;
    }
    validateBrowserset(browsers) {

        return async (dispatch) => {
    
            StatusActions.started();

            try {
                const response = await axios.post('/browsers/validate', { browsers: browsers });
                console.log(response);
                dispatch({ok: true, message: 'hihi'});
            } catch (err) {
                console.error(err);
                dispatch({ok: false, error: err.data});
            }

            StatusActions.done();

        }

    }
}

module.exports = (alt.createActions(BrowsersActions));
