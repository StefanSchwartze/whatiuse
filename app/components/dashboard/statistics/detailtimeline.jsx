import React from 'react';
import ReactDOM from 'react-dom';

import {ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, CartesianGrid, Area, XAxis, YAxis} from 'recharts';
import HistoryTooltip from '../../shared/history-tooltip';

import moment from 'moment';
import {orderBy} from 'lodash';

export default class DetailTimeline extends React.PureComponent {
	static propTypes = {
		isChecking: React.PropTypes.bool.isRequired,
		snapshots: React.PropTypes.array.isRequired,
		length: React.PropTypes.number.isRequired
	}
	constructor(props) {
		super(props);
	}
	render() {
		const toPercent = (decimal, fixed = 0) => {
			return `${(decimal * 100).toFixed(fixed)}%`;
		};
		const snapshots = this.props.snapshots.map((item, index) => {
			return {
				missingSupport: item.missingSupport,
				partialSupport: item.partialSupport,
				fullSupport: 100 - item.missingSupport - item.partialSupport
			}
		});
		const lastCheck = this.props.isChecking ? 
			(<span><i className="icon icon-spinner8 animate rotate"></i>Currently checking…</span>) : 
			(<span>{moment(snapshots[snapshots.length - 1].captured).calendar()}</span>);

		return (
			<div className="history-container">
				<div className="description">
					<span>Timeline</span>
					<span className="align-right">Last check: {lastCheck}</span>
				</div>
				<HistoryTooltip/>
				<div className="chart chart--extended">
					<ResponsiveContainer>

						<AreaChart width={1000} height={600} data={snapshots} stackOffset="expand">
							<XAxis dataKey="captured"/>
							<YAxis tickFormatter={toPercent}/>
							<CartesianGrid strokeDasharray="3 3"/>
							<Area type='monotone' dataKey='fullSupport' stackId="1" stroke='#82ca9d' fill='#82ca9d' />
							<Area type='monotone' dataKey='partialSupport' stackId="1" stroke='#ffc658' fill='#ffc658' />
							<Area type='monotone' dataKey='missingSupport' stackId="1" stroke='#f36666' fill='#f36666' />
						</AreaChart>




					</ResponsiveContainer>
				</div>
			</div>
		);
	}
}

