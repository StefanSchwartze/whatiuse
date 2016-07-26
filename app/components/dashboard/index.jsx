import React from 'react';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';

import StatisticsContainer from './statistics/statistics-container';

import {findItemById} from 'utils/store-utils';
import {forEach, floor, values, head} from 'lodash';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

@authDecorator
@connectToStores
export default class Dashboard extends React.Component {
	static getStores(props) {
		return [PagesStore];
	}
	static getPropsFromStores(props) {
		return PagesStore.getState();
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		return PagesActions.fetch();
	}
	componentDidMount() {
		let socket = io.connect();
		socket.on('connect', function() {
			socket.on('progress', function(data) {
				PagesActions.progress({ progress: data.progress, pageId: data.pageId});
			}); 
			socket.on('triggerComplete', function(data) {
				PagesActions.checkComplete(data.data);
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
		const pages = JSON.parse(JSON.stringify(this.props.pages));
		const currentPageId = this.props.currentPageId;
		let statistics = <div></div>
		if(pages.length > 0) {
			statistics = <StatisticsContainer page={this.currentPage(pages, currentPageId)} />
		}
		return (
			<div>
				<PagesList 
					completeSupport={this.calcCompleteSupport(pages)}
					pages={pages}
					currentPageId={currentPageId} />
				{statistics}
			</div>
		);
	}
}