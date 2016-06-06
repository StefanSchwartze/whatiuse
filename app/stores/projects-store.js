import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import ProjectsActions from 'actions/projects-actions';

class PagesStore {
	constructor() {
		this.bindActions(ProjectsActions);
		this.projects = [];
		this.currentProjectId = null;
	}
	onAdd(item) {
		this.projects.push(item);
	}
	onFetch(projects) {
		this.projects = projects;
	}
	onGet(page) {
		this.currentProjectId = page._id;
	}
	onUpdate(item) {
		assign(findItemById(this.projects, item._id), item);
	}
	onDelete(item) {
		this.projects.splice(findIndexById(this.projects, item._id), 1);
	}
	onRemoveCurrent() {
		this.currentProjectId = null;
	}
	onSelectPage(id) {
		if(this.currentProjectId !== id) {
			this.currentProjectId = id;
		}
	}
}

module.exports = (alt.createStore(PagesStore));
