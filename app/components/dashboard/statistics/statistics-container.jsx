import React from 'react';
import ReactDOM from 'react-dom';

import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

import {findItemById} from 'utils/store-utils';
import {sortBy, orderBy, flatten, reduce, forEach} from 'lodash';

import connectToStores from 'alt/utils/connectToStores';
import StatusStore from 'stores/status-store';
import StatusActions from 'actions/status-actions';

import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';

@connectToStores
export default class StatisticsContainer extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		allElements: React.PropTypes.array,
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
		let elements = [];

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

				elements = this.props.allElements || elements;

			} else {
				page = findItemById(this.props.pages, this.props.currentPageId);
				if(page.snapshots.length > 0) {
					elements = page.snapshots[page.snapshots.length - 1].elementCollection || elements;
				}
			}
			page = 	<div>
						<p>Most used elements:</p>
						<ElementsList elements={elements} orderProp="count" />
						<p>Most crashing elements:</p>
						<ElementsList elements={elements} orderProp="impact" unit="%" />
						<p>Your site works out of the box with:</p>
						<BrowsersList browsers={browsers} />
						<div className="charts-container">
							<div className="chart-container">
								<ResponsiveContainer>
									<BarChart
										data={orderBy(elements, 'count', 'desc')}>
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
			page = <span>No pages investigated yet.</span>;
		}
		return (
			<div className="">
				{page}
			</div>
		);
	}
}

