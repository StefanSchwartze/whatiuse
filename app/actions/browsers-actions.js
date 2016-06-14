import alt from 'utils/alt';
import {findItemById} from 'utils/store-utils';

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
}

module.exports = (alt.createActions(BrowsersActions));
