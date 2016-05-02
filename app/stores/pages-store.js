import alt from 'utils/alt';
import {assign} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import PagesActions from 'actions/pages-actions';

class PagesStore {
	constructor() {
		this.bindActions(PagesActions);
		this.pages = [];
		this.currentPageId = 'all';
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
		this.currentPageId = 'all';
	}
	onSelectPage(id) {
		this.currentPageId = id;
	}
}

module.exports = (alt.createStore(PagesStore));
