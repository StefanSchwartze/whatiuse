import React from 'react';
import ReactDOM from 'react-dom';

import {ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, CartesianGrid, Area, XAxis, YAxis} from 'recharts';
import HistoryTooltip from '../../shared/history-tooltip';

import moment from 'moment';
import {orderBy} from 'lodash';

export default class DetailTimeline extends React.PureComponent {
	static propTypes = {
		snapshots: React.PropTypes.array.isRequired
	}
	constructor(props) {
		super(props);
	}
	render() {
		const toPercent = (decimal, fixed = 0) => {
			return `${(decimal * 100).toFixed(fixed)}%`;
		};
		const renderTooltipContent = (o) => {
			const { payload, label } = o;
			return (
				<div className="history-tooltip">
					<p className="label">{`${label}`}</p>
					<ul className="list">
						{
							payload.map((entry, index) => (
								<li className="" key={`item-${index}`} style={{color: entry.color}}>
								{`${entry.name}: ${entry.value.toFixed(2)}%`}
								</li>
							))
						}
					</ul>
				</div>
			);
		};
		
		const snapshots = this.props.snapshots.map((item, index) => {
			return {
				missingSupport: item.missingSupport,
				partialSupport: item.partialSupport,
				fullSupport: 100 - item.missingSupport - item.partialSupport,
				captured: moment(item.captured).calendar()
			}
		});

		return (
			<div className="history-container content-container">
				<HistoryTooltip/>
				<div className="chart">
					<ResponsiveContainer>
						<AreaChart width={1280} height={80} data={snapshots}
							margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
							{/*<XAxis dataKey="captured" />*/}
							{/*<YAxis />*/}
							<Tooltip content={renderTooltipContent}/>
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

