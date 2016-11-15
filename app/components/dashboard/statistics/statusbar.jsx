import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import ProgressBar from './progressbar';
import DetailTimeline from './detailtimeline';
import PagesActions from 'actions/pages-actions';

export default class Statusbar extends React.Component {
	static propTypes = {
		lastUpdate: React.PropTypes.string.isRequired,
		page: React.PropTypes.object.isRequired,
		isChecking: React.PropTypes.bool.isRequired,
		snapshots: React.PropTypes.array,
		showTimeline: React.PropTypes.bool
	}
	constructor(props) {
		super(props);
	}
	checkUrl() {
		PagesActions.triggerURLCheck(this.props.page);
	}
	cancelCheck() {
		PagesActions.cancelCheck(this.props.page._id);
	}
	handleClick() {
		if(this.props.onShowTimelineClick) {
			this.props.onShowTimelineClick();
		}
	}
	render() {
		const lastUpdate = this.props.lastUpdate;
		const isChecking = this.props.isChecking;
		const progress = this.props.page.progress;
		const title = this.props.page.title;
		const imagePath = this.props.page.imgSrc;
		const hasTimeline = this.props.snapshots.length > 0;
		const button = isChecking ? 
						<button onClick={this.cancelCheck.bind(this)} className="button button--wide button--strong button--red" >Abort</button> :
						<button onClick={this.checkUrl.bind(this)} className="button button--wide button--accent button--accent-bright" >CHECK</button>
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
			<div >
				<div className="statusbar-container">
					<div className="statusbar content-container">
						<div className="detail">
							<div 
								className="page-thumb-mini"
								style={{
									backgroundImage: 'url(/' + imagePath + ')'
								}}
							>
							</div>
							<label className="highlight-label">{title}</label>
						</div>
						{button}
						{status}
						{
							this.props.snapshots.length > 1 &&
							<span 
								className={classnames('icon-history', this.props.showTimeline ? 'active' : '') }
								onClick={this.handleClick.bind(this)}
							>
							</span>
						}
					</div>
				</div>
				<div className={classnames('timeline-container', this.props.showTimeline ? '' : 'hide') }>
				{
					this.props.snapshots.length > 1 && this.props.showTimeline && 
						<DetailTimeline snapshots={this.props.snapshots} />
				}
				</div>
			</div>
		);
	}
}

