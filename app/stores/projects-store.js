import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';

class ProjectsStore {
	constructor() {
		this.bindActions(this.alt.getActions('projects'));
		this.projects = [];
    	this.projectsHash = {};
		this.currentProjectId = "";
	}
	onAdd(item) {
		this.projects.push(item);
	}
	onFetch(projects) {
		this.projects = projects;
		this.projectsHash = this.projects.reduce((hash, item) => {
	      hash[item._id] = item;
	      return hash;
	    }, {});
	}
	onGet(project) {
		if(this.projects.length === 0) {
			this.projects.push(project);
		}
		this.currentProjectId = project._id;
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

module.exports = {
	default: (alt.createStore(ProjectsStore)),
	raw: ProjectsStore
}
