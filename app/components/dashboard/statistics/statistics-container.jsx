import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line} from 'recharts';
import HistoryTooltip from '../../shared/history-tooltip';

import {findItemById} from 'utils/store-utils';
import {sortBy, orderBy, flatten, reduce, forEach} from 'lodash';

import connectToStores from 'alt-utils/lib/connectToStores';
import StatusStore from 'stores/status-store';
import StatusActions from 'actions/status-actions';

import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';

export default class StatisticsContainer extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		allElements: React.PropTypes.array,
		currentPageId: React.PropTypes.string
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		let page;
		let timeline;
		let elements = [];
		let snapshots = [];

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

				elements = this.props.allElements || [];

			} else {
				const page = findItemById(this.props.pages, this.props.currentPageId);
				console.log(this.props.pages);
				if(page.snapshots.length > 0) {
					elements = page.snapshots[page.snapshots.length - 1].elementCollection;
				}
				snapshots = page.snapshots;
				if(page.snapshots.length > 1) {
					timeline = <div className="history-container">
									<p className="label">Timeline</p>
									<HistoryTooltip/>
									<div className="chart">
										<ResponsiveContainer>
											<LineChart data={snapshots} height={100} width={1000}>
												<Line type='monotone' dataKey='pageSupport' stroke='#8884d8' strokeWidth={1} />
												<Tooltip content={<HistoryTooltip/>}/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>
				}
			}
			page = 	<div>
						{timeline}
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

