import React from 'react';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';
import SnapshotsStore from 'stores/snapshots-store';
import SnapshotsActions from 'actions/snapshots-actions';

import StatisticsContainer from './statistics/statistics-container';

import {findItemById} from 'utils/store-utils';
import {forEach, floor, values, head} from 'lodash';

import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class Dashboard extends React.Component {
	static getStores(props) {
		return [PagesStore, SnapshotsStore];
	}
	static getPropsFromStores(props) {
		return {
			pages: PagesStore.getState().pages,
			snapshots: SnapshotsStore.getState().snapshots
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
			socket.on('triggerComplete', function(data) {
				if(data.error) {
					PagesActions.checkFailed(data);
				} else {
					PagesActions.checkComplete(data.data);
				}
			});
		});
	}
	calcElementSum(pages) {
		let elementsArray = [];
		const pagesCol = pages;

		forEach(pagesCol, function(value, key) {
			const snapshots = value.snapshots || [];
			if(snapshots.length > 0) {
				elementsArray.push(head(snapshots).elementCollection);
			}
		});
		let pageArr = [].concat.apply([], elementsArray);

		let newArr = values(pageArr.reduce(function(prev, current, index, array){
		   if(!(current.name in prev.result)) {
		      prev.result[current.name] = current;  
		   } 
		   else {
		   		if(prev.result[current.name]) {
		       		prev.result[current.name].count += current.count;
		   		}
		   }  

		   return prev;
		},{result: {}}).result);

		return JSON.parse(JSON.stringify(newArr));
	}
	calcCompleteSupport(pages) {
		let sum = 100;
		if(pages && pages.length > 0) {
			for (var i = 0; i < pages.length; i++) {
				if(pages[i].snapshots && pages[i].snapshots.length > 0) {
					let support = pages[i].latestSupport || sum;
					if(support < sum) {
						sum = support;
					}
				}
			}
		} else {
			return '- ';
		}
		return floor(sum, 2).toString();
	}
	currentPage(pages, currentPageId) {
		if(pages && currentPageId === 'all') {
			const collection = this.calcElementSum(pages);
			return { snapshots: [{ elementCollection: collection}] };
		} else {
			return findItemById(pages, currentPageId) || {};
		}
	}
	render() {
		const scope = this.props.params.scope;
		const pages = this.props.pages;
		const snapshots = this.props.snapshots;
		const currentPageId = this.props.params.pageid || '';
		const currentProjectId = this.props.params.projectid || '';
		const currentElementId = this.props.params.elementid || '';
		let statistics = <div></div>
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
					completeSupport={this.calcCompleteSupport(pages)}
					pages={pages}
					currentPageId={currentPageId}
					currentProjectId={currentProjectId}
					currentScope={scope} />
				{statistics}
			</div>
		);
	}
}