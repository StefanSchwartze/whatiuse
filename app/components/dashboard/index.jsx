import React from 'react';
import AltContainer from 'alt/AltContainer';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';

import BrowsersStore from 'stores/browsers-store';

import StatisticsContainer from './statistics/statistics-container';

import {sortBy, orderBy, flatten, reduce, forEach, floor} from 'lodash';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt/utils/connectToStores';

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
	componentWillMount() {
		return PagesActions.fetch();
	}
	calcElementSum(pages) {
		var elementsArray = [];

		forEach(pages, function(value, key) {
			if(value.snapshots.length > 0) {
				elementsArray.push(value.snapshots[value.snapshots.length - 1].elementCollection);
			}
		});

		var pageArr = [].concat.apply([], elementsArray);

		return pageArr.reduce(function(prev, current, index, array){
		   if(!(current.name in prev.keys)) {
		      prev.keys[current.name] = index;
		      prev.result.push(current);   
		   } 
		   else {
		   		if(prev.result[prev.keys[current.name]]) {
		       		prev.result[prev.keys[current.name]].count = prev.result[prev.keys[current.name]].count + current.count;
		   		} else {
		       		prev.result[prev.result.length - 1].count = prev.result[prev.result.length - 1].count + current.count;

		   		}
		   }  

		   return prev;
		},{result: [], keys: {}}).result;
	}
	calcCompleteSupport(pages) {
		let sum = 100;
		for (var i = 0; i < pages.length; i++) {
			if(pages[i].snapshots && pages[i].snapshots.length > 0) {
				let support = pages[i].snapshots[pages[i].snapshots.length - 1].pageSupport || sum;
				if(support < sum) {
					sum = support;
				}
			}
		}
		return floor(sum, 2);
	}
	render() {
		return (
			<AltContainer
				stores={{
					PagesStore: PagesStore
				}}>
				<div className="content-container edged content slider-container">
					<PagesList 
						completeSupport={this.calcCompleteSupport(this.props.pages)}
						pages={this.props.pages}
						currentPageId={this.props.currentPageId} />
				</div>
				<div className="content-container content statistics-container">
					<StatisticsContainer
						allElements={this.calcElementSum(this.props.pages)}
						pages={this.props.pages}
						currentPageId={this.props.currentPageId} />
				</div>
			</AltContainer>
		);
	}
}