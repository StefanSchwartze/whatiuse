import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line} from 'recharts';
import HistoryTooltip from '../../shared/history-tooltip';

import moment from 'moment';
import {orderBy} from 'lodash';

import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';

export default class StatisticsContainer extends React.Component {
	static propTypes = {
		page: React.PropTypes.object
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		let pageElem;
		let timeline;

		if(Object.keys(this.props.page).length > 0) {
			
			if(this.props.page.snapshots && this.props.page.snapshots.length > 0) {
			
				const page = this.props.page;
				let snapshots = page.snapshots || [];
				let elements = page.snapshots[page.snapshots.length - 1].elementCollection || [];
				let lastCheck = page.isChecking ? (<span><i className="icon icon-spinner8 animate rotate"></i>Currently checking…</span>) : moment(page.snapshots[page.snapshots.length - 1].captured).calendar();

				if(page.snapshots.length > 1) {
					timeline = <div className="history-container">
									<div className="description">
										<span>Timeline</span>
										<span>Last check: {lastCheck}</span>
									</div>
									<HistoryTooltip/>
									<div className="chart">
										<ResponsiveContainer>
											<LineChart data={snapshots} height={100} width={1000}>
												<Line type='monotone' dataKey='pageSupport' stroke='#25bcca' strokeWidth={1} />
												<Tooltip content={<HistoryTooltip/>}/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>
				}

				pageElem = 	<div>
							{timeline}
							<div className="description">
								<p>Most used elements:</p>
							</div>
							<ElementsList elements={elements} orderProp="count" />
							<div className="description">
								<p>Most crashing elements:</p>
							</div>
							<ElementsList elements={elements} orderProp="impactMissing" unit="%" />
							<div className="charts-container">
								<div className="chart-container">
									<ResponsiveContainer>
										<BarChart
											data={orderBy(elements, 'count', 'desc')}>
											<XAxis dataKey="name"/>
											<YAxis/>
											<CartesianGrid />
											<Tooltip/>
											<Bar dataKey="count" fill="#25bcca" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>;
			} else {
				pageElem = <span>Not investigated yet.</span>;
			}
		} else {
			pageElem = <span>No page selected…</span>;
		}
		return (
			<div className="content-container content statistics-container">
				{pageElem}
			</div>
		);
	}
}

