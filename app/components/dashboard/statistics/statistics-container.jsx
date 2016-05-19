import React from 'react';
import ReactDOM from 'react-dom';

import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

import {findItemById} from 'utils/store-utils';
import {sortBy, orderBy, flatten, reduce} from 'lodash';

import connectToStores from 'alt/utils/connectToStores';
import StatusStore from 'stores/status-store';
import StatusActions from 'actions/status-actions';

import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';

@connectToStores
export default class StatisticsContainer extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		currentPageId: React.PropTypes.string
	}
	static getStores() {
		return [
			StatusStore
		];
	}
	static getPropsFromStores() {
		return StatusStore.getState();
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
	}
	render() {
		let page;
		let elements = [
			{
				title: 'flexbox',
				used: 50
			},
			{
				title: 'gradient',
				used: 30
			},
			{
				title: 'font-face',
				used: 12
			},
			{
				title: 'pi',
				used: 10
			},
			{
				title: 'pa',
				used: 10
			},
			{
				title: 'po',
				used: 7
			},
			{
				title: 'jenes',
				used: 3
			}

		];

		let elementshtml = [
			{
				title: 'section',
				used: 80
			},
			{
				title: 'h2',
				used: 60
			},
			{
				title: 'audio',
				used: 20
			},
			{
				title: 'video',
				used: 17
			},
			{
				title: 'header',
				used: 3
			},
			{
				title: 'article',
				used: 1
			}

		];

		let browsers = [
			{
				title: 'Firefox',
				slug: 'firefox',
				version: 32
			},
			{
				title: 'Chrome',
				slug: 'chrome',
				version: 42
			},
			{
				title: 'IE',
				slug: 'IE',
				version: 10
			},
			{
				title: 'Opera',
				slug: 'opera',
				version: 12
			},
			{
				title: 'Safari',
				slug: 'safari',
				version: 4.5
			}

		];

		if(this.props.pages.length > 0) {
			
			if(this.props.currentPageId === 'all') {

				var arr1 = [{name: "age", value: 18}, {name: "age", value: 10}];
				var arr2 = [{name : "age", value: 5}, {name: "lang", value: "English"}];
				var arr3 = [{name : "age", value: 5}, {name: "age", value: 13}];
				var arr4 = [{name : "age", value: 5}];



				var pages = [arr1, arr2, arr3, arr4];

				var finArr = [].concat.apply([], pages); 






				var arr1 = new Array(
					{name : "age", value: 5}, 
					{name: "lang", value: 99}, 
					{name: "age", value: 18}, 
					{name : "age", value: 5}, 
					{name: "lang", value: 13}, 
					{name: "foo", value: 6}, 
					{name: "bar", value: 2}, 
					{name: "bar", value: 3}, 
					{name : "age", value: 7});

				var arr = arr1.reduce(function(prev, current, index, array){
				   if(!(current.name in prev.keys)) {
				      prev.keys[current.name] = index;
				      prev.result.push(current);   
				   } 
				   else {
				   		if(prev.result[prev.keys[current.name]]) {
				       		prev.result[prev.keys[current.name]].value = prev.result[prev.keys[current.name]].value + current.value;
				   		} else {
				       		prev.result[prev.result.length - 1].value = prev.result[prev.result.length - 1].value + current.value;

				   		}
				   }  

				   return prev;
				},{result: [], keys: {}}).result;

				console.log(arr)








			} else {
				page = findItemById(this.props.pages, this.props.currentPageId);
				if(page.elementsCollections.length > 0) {
					elements = page.elementsCollections[page.elementsCollections.length - 1].elementCollection || elements;
					elements = orderBy(elements, 'count', 'desc');
				}
			}
			page = 	<div>
						<p>Most used elements:</p>
						<ElementsList elements={elements} />
						<p>Most crashing elements:</p>
						<ElementsList elements={[]} />
						<p>Your site works out of the box with:</p>
						<BrowsersList browsers={browsers} />
						<div className="charts-container">
							<div className="chart-container">
								<ResponsiveContainer>
									<BarChart
										data={elements}>
										<XAxis dataKey="name"/>
										<YAxis/>
										<CartesianGrid />
										<Tooltip/>
										<Legend />
										<Bar dataKey="count" fill="#82ca9d" />
									</BarChart>
								</ResponsiveContainer>
							</div>
							<div className="chart-container">
								<ResponsiveContainer>
									<BarChart
										data={elementshtml}>
										<XAxis dataKey="title"/>
										<YAxis/>
										<CartesianGrid />
										<Tooltip/>
										<Legend />
										<Bar dataKey="used" fill="#82ca9d" />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>;

		} else {
			page = <span>Loading...</span>;
		}
		return (
			<div className="">
				{page}
			</div>
		);
	}
}

