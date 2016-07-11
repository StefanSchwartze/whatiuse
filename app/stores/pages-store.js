import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import PagesActions from 'actions/pages-actions';

if(!process.env.BROWSER) {
	var socket = require('socket.io-client')('http://localhost');
} else {
	var socket = io();
}

class PagesStore {
	constructor() {
		this.bindActions(PagesActions);
		this.pages = [];
		this.currentPageId = '';
		socket.on('connect', () => {
			console.log('Uhh, connected!');
			/*socket.on('progress', (data) => {
				console.log(data);
				//this.onProgress(data.progress, data.id);
			});*/
		});
	}
	onAdd(item) {
		this.pages.push(item);
	}
	onFetch(pages) {
		this.pages = pages;
	}
	onGet(page) {
		this.currentPageId = page._id;
	}
	onUpdate(item) {
		assign(findItemById(this.pages, item._id), item);
	}
	onDelete(item) {
		this.pages.splice(findIndexById(this.pages, item._id), 1);
	}
	onRemoveCurrent() {
		this.currentPageId = '';
	}
	onSelectPage(id) {
		if(this.currentPageId !== id) {
			this.currentPageId = id;
		}
	}
	onChecking(id) {
		let page = findItemById(this.pages, id);
		page.isChecking = true;
		assign(findItemById(this.pages, id), page);
	}
	onChecked(id) {
		let page = findItemById(this.pages, id);
		page.isChecking = false;
		assign(findItemById(this.pages, id), page);
	}
	onCreateBackground(data) {
	}
	onProgress(data) {
		let page = findItemById(this.pages, data.pageId);
		page.progress = data.progress;
		assign(findItemById(this.pages, data.pageId), page);
	}
}

module.exports = (alt.createStore(PagesStore));