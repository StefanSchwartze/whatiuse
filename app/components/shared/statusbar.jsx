import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import ProgressBar from './progressbar';
import PagesActions from 'actions/pages-actions';

export default class Statusbar extends React.Component {
	static propTypes = {
		lastUpdate: React.PropTypes.string.isRequired,
		page: React.PropTypes.object.isRequired,
		isChecking: React.PropTypes.bool.isRequired
	}
	constructor(props) {
		super(props);
	}
	checkUrl() {
		PagesActions.triggerURLCheck(this.props.page);
	}
	render() {
		const lastUpdate = this.props.lastUpdate;
		const isChecking = this.props.isChecking;
		const progress = this.props.page.progress;
		const button = isChecking ? 
						<button onClick={this.checkUrl.bind(this)} className="button button--wide button--strong button--red" >Abort</button> :
						<button onClick={this.checkUrl.bind(this)} className="button button--wide button--strong button--accent" >Check</button>
		const status = isChecking ?
						<ProgressBar 
							progress={progress || 0} 
							status={this.props.page.status} 
						/> : 
						<p>Last check:
							<strong>{
								' ' + (
								moment(lastUpdate).isValid() ? 
								moment(lastUpdate).calendar() :
								'Not investigated yet.')
							}</strong>
						</p>
		return (
			<div className="statusbar-container">
				{button}
				{status}
			</div>
		);
	}
}

