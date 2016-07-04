import React from 'react';
import ReactDOM from 'react-dom';
import { floor } from 'lodash';
import moment from 'moment';

export default class HistoryTooltip extends React.Component {
	static propTypes = {
		type: React.PropTypes.string,
		payload: React.PropTypes.array,
		label: React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ])
	}
	render() {
		if (this.props.active) {
			return (
				<div className="history-tooltip">
					<p className="label">{moment(this.props.payload[0].payload.captured).calendar()}</p>
					<p className="value">{floor(this.props.payload[0].payload.pageSupport, 2)}%</p>
				</div>
			);
		}
		return null;
	}
}

