import alt from 'utils/alt';
import {assign} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import PagesActions from 'actions/pages-actions';

class PagesStore {
	constructor() {
		this.bindActions(PagesActions);
		this.pages = [];
		this.pagesHash = {};
		this.currentPage = null;
	}
	onAdd(item) {
		this.pages.push(item);
	}
	onFetch(pages) {
		this.pages = pages;
		this.pagesHash = this.pages.reduce((hash, item) => {
			hash[item._id] = item;
			return hash;
		}, {});
	}
	onGet(page) {
		this.currentPage = page;
	}
	onUpdate(item) {
		assign(findItemById(this.pages, item._id), item);
	}
	onDelete(item) {
		this.pages.splice(findIndexById(this.pages, item._id), 1);
	}
	onRemoveCurrent() {
		this.currentPage = null;
	}
}

module.exports = (alt.createStore(PagesStore));
