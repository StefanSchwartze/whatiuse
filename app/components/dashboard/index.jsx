import React from 'react';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import StatusStore from 'stores/status-store';
import {findItemById} from 'utils/store-utils';
import PagesActions from 'actions/pages-actions';
import SnapshotsStore from 'stores/snapshots-store';
import SnapshotsActions from 'actions/snapshots-actions';
import connectToStores from 'alt-utils/lib/connectToStores';
import StatisticsContainer from './statistics/statistics-container';

@connectToStores
export default class Dashboard extends React.Component {
	static getStores(props) {
		return [PagesStore, SnapshotsStore, StatusStore];
	}
	static getPropsFromStores(props) {
		return {
			pages: PagesStore.getState().pages,
			snapshots: SnapshotsStore.getState().snapshots,
			queue: StatusStore.getState().queue
		}
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		PagesActions.fetch({
			"conditions": { 
				projectId: this.props.params.projectid
			}
		});
		SnapshotsActions.fetch({
			"conditions": { 
				pageId: this.props.params.pageid,
				scope: this.props.params.scope
			}
		});
	}
	componentDidMount() {
		let socket = io.connect();
		socket.on('connect', function() {
			socket.on('progress', function(data) {
				PagesActions.checking(data.pageId);
				PagesActions.progress({ progress: data.progress, pageId: data.pageId, info: data.status});
			});
			socket.on('cancelComplete', function(data) {
				PagesActions.checkFailed(data.id);
			}); 
			socket.on('triggerComplete', function(data) {
				if(data.error) {
					PagesActions.checkFailed(data);
				} else {
					PagesActions.checkComplete(data.data);
				}
			});
		});
	}
	currentPage(pages, currentPageId) {
		return findItemById(pages, currentPageId) || {};
	}
	render() {
		const scope = this.props.params.scope;
		const pages = this.props.pages;
		const snapshots = this.props.snapshots;
		const currentPageId = this.props.params.pageid || '';
		const currentProjectId = this.props.params.projectid || '';
		const currentElementId = this.props.params.elementid || '';
		let statistics = "";
		if(pages.length > 0) {
			statistics = <StatisticsContainer 
							page={this.currentPage(pages, currentPageId)}
							snapshots={snapshots}
							currentElementId={currentElementId}
							currentProjectId={currentProjectId}
							currentScope={scope}
						/>
		}
		return (
			<div>
				<PagesList
					pages={pages}
					currentPageId={currentPageId}
					currentProjectId={currentProjectId}
					currentScope={scope}
					isLoading={this.props.queue.indexOf('Pages') > -1} />
				{statistics}
			</div>
		);
	}
}