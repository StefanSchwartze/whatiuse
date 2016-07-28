import alt from 'utils/alt';
import {assign, map} from 'lodash';
import {findItemById, findIndexById} from 'utils/store-utils';
import SnapshotsActions from 'actions/snapshots-actions';

class SnapshotStore {
	constructor() {
		this.bindActions(SnapshotsActions);
		this.snapshots = [];
	}
	onAdd(item) {
		this.snapshots.push(item);
	}
	onFetch(snapshots) {
		this.snapshots = snapshots;
	}
	onGet(snapshot) {
		this.currentSnapshotId = snapshot._id;
	}
	onUpdate(item) {
		assign(findItemById(this.snapshots, item._id), item);
	}
	onDelete(item) {
		this.snapshots.splice(findIndexById(this.snapshots, item._id), 1);
	}
	onSave(item) {
		this.snapshots.push(item);
	}
}

module.exports = (alt.createStore(SnapshotStore));