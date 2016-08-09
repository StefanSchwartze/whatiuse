import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {ResponsiveContainer, Tooltip, LineChart, Line} from 'recharts';
import HistoryTooltip from '../../shared/history-tooltip';

import moment from 'moment';
import {orderBy} from 'lodash';

export default class Timeline extends React.Component {
	static propTypes = {
		isChecking: React.PropTypes.bool.isRequired,
		snapshots: React.PropTypes.array.isRequired
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		const snapshots = this.props.snapshots || [];
		const lastCheck = this.props.isChecking ? 
			(<span><i className="icon icon-spinner8 animate rotate"></i>Currently checking…</span>) : 
			(<span>{moment(snapshots[snapshots.length - 1].captured).calendar()}</span>);

		return (
			<div className="history-container">
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
		);
	}
}

