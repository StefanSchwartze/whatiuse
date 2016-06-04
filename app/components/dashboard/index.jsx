import React from 'react';
import AltContainer from 'alt-container';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';

import BrowsersStore from 'stores/browsers-store';

import StatisticsContainer from './statistics/statistics-container';

import {sortBy, orderBy, flatten, reduce, forEach, floor, map, values, head} from 'lodash';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

@authDecorator
@connectToStores
export default class Dashboard extends React.Component {
	static propTypes = {
		item: React.PropTypes.object,
		pages: React.PropTypes.array,
		currentPageId: React.PropTypes.string
	}
	static getStores(props) {
		return [PagesStore];
	}
	static getPropsFromStores(props) {
		return PagesStore.getState();
	}
	constructor(props) {
		super(props);
	}
	shouldComponentUpdate(nextProps) {
		return !Object.is(JSON.stringify(nextProps), JSON.stringify(this.props));
	}
	componentWillMount() {
		return PagesActions.fetch();
	}
	calcElementSum(pages) {
		let elementsArray = [];
		const pagesCol = pages;

		forEach(pagesCol, function(value, key) {
			const snapshots = value.snapshots;
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
		for (var i = 0; i < pages.length; i++) {
			if(pages[i].snapshots && pages[i].snapshots.length > 0) {
				let support = pages[i].latestSupport || sum;
				if(support < sum) {
					sum = support;
				}
			}
		}
		return floor(sum, 2);
	}
	render() {
		const pages = JSON.parse(JSON.stringify(this.props.pages));
		return (
			<AltContainer
				stores={{
					PagesStore: PagesStore
				}}>
				<div className="content-container edged content slider-container">
					<PagesList 
						completeSupport={this.calcCompleteSupport(pages)}
						pages={pages}
						currentPageId={this.props.currentPageId} />
				</div>
				<div className="content-container content statistics-container">
					<StatisticsContainer
						allElements={this.calcElementSum(pages)}
						pages={pages}
						currentPageId={this.props.currentPageId} />
				</div>
			</AltContainer>
		);
	}
}