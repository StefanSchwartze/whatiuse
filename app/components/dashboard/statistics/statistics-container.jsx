import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import { StickyContainer, Sticky } from 'react-sticky';
import Timeline from './timeline';
import DetailTimeline from './detailtimeline';
import classnames from 'classnames';
import PercentagePie from '../../shared/percentagepie';
import FilterList from '../../shared/filterable-list';
import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';
import ElementsChart from '../../shared/elements-chart';
import Statusbar from '../../shared/statusbar';

export default class StatisticsContainer extends React.Component {
	static propTypes = {
		page: React.PropTypes.object.isRequired,
		snapshots: React.PropTypes.array.isRequired,
		currentElementId: React.PropTypes.string.isRequired,
		currentProjectId: React.PropTypes.string.isRequired,
		currentScope: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			showDetailed: true,
			showMoreMissing: false,
			showMorePartial: false
		}
	}
	render() {
		let pageElem;
		let timeline;
		if(Object.keys(this.props.page).length > 0) {

			let results = '';

			const page = this.props.page;
			const snapshots = this.props.snapshots || [];
			let status = '';
			let partialSupportElem;
			let missingSupportElem;
			let whatIfIDeleteElem;
			let fullSupport = 100;
			let elements;
			let whatifiuse;

			if(this.props.snapshots.length > 0) {
			
				const lastSnapshot = snapshots[snapshots.length - 1];
				elements = lastSnapshot.elementCollection || [];
				whatifiuse = lastSnapshot.whatIfIUse;
				status = lastSnapshot.captured;

				if(snapshots.length > 1) {
					timeline = 	<div>{/*<div className="content-container content timeline-container">
									<DetailTimeline
										snapshots={snapshots}
										isChecking={page.isChecking || false}
										length={snapshots.length}
									/>
								</div>*/}</div>
				}
				if(lastSnapshot.partialSupport) {
					const partialSupport = parseFloat(lastSnapshot.partialSupport.toFixed(2)) || 0;
					fullSupport -= partialSupport;
					partialSupportElem = 
						<Tooltip
							overlayClassName="tooltip--simple"
							placement="top"
							mouseEnterDelay={0}
							mouseLeaveDelay={0}
							destroyTooltipOnHide={true}
							overlay={
								<div style={{maxWidth: 320}}>
									{
										<ul>
											<li>{partialSupport} % of your users just partially support one or more features on this page.</li>
											<li>Partial support means a feature just works with vendor prefixes or does not have the full functionality.</li>
											<li>In most cases, there is no difference between fully and partially supported features.</li>
										</ul>
									}
								</div>
							}
						>
							<div className="box box--element">
								<div className="box-head">
									<PercentagePie 
										value={partialSupport} 
										color="#e0cd28"
									/>
									<h3>Partially supported</h3>
								</div>
							</div>
						</Tooltip> 
				}
				if(lastSnapshot.missingSupport) {
					const missingSupport = parseFloat(lastSnapshot.missingSupport.toFixed(2)) || 0;
					fullSupport -= missingSupport;
					missingSupportElem = 
						<Tooltip
							overlayClassName="tooltip--simple"
							placement="top"
							mouseEnterDelay={0}
							mouseLeaveDelay={0}
							destroyTooltipOnHide={true}
							overlay={
								<div style={{maxWidth: 320}}>
									{missingSupport + '% of your users do not support one or more features on this page.'}
								</div>
							}
						>
							<div className="box box--element">
								<div className="box-head">
									<PercentagePie 
										value={missingSupport} 
										color="#bd1010"
									/>
									<h3>Not supported</h3>
								</div>
							</div>
						</Tooltip>
				}
				if(lastSnapshot.whatIfIDelete) {
					const recommendations = lastSnapshot.whatIfIDelete;
					whatIfIDeleteElem = 
						<div className="box box--element">
							<div className="box-head">
								<h3>{recommendations.length} Recommendations</h3>
							</div>
						</div>
				}
			}
			pageElem = <div>
							<Sticky>
								<div className="content-container timeline-container">
									<Statusbar
										isChecking={page.isChecking || false}
										page={this.props.page}
										lastUpdate={status}
									/>
								</div>
								{timeline}
							</Sticky>
							<div className="content-container statistics-container">
								<Sticky 
									topOffset={-80}
									stickyStyle={{marginTop: '80px'}}
								>
									<div className="sidebar">
										<div className="description">
											<h1 className="big">Latest result:</h1>
											
											{missingSupportElem}
											{partialSupportElem}

											<div className="box box--element">
												<div className="box-head">
													<PercentagePie 
														value={parseFloat(fullSupport.toFixed(2))} 
														color="rgb(71, 191, 109)"
													/>
													<h3>Fully supported</h3>
												</div>
											</div>

											{whatIfIDeleteElem}
										</div>
									</div>
								</Sticky>
								
								<div className="content">
									<div className="description">
										<button 
											className={classnames('button rounded box-shadow button--toggle icon-list align-right', this.state.showDetailed ? 'active' : '')}
											onClick={() => this.setState({ showDetailed: true })} 
										/>								
										<button 
											className={classnames('button rounded box-shadow button--toggle icon-piles', this.state.showDetailed ? '' : 'active')}
											onClick={() => this.setState({ showDetailed: false })} 
										/>								
									</div>
									<div className="dyn-columns">
										<div className="col2">
											<div className="description">
												<p>Features with missing support:</p>
											</div>
											<ElementsList 
												currentProjectId={this.props.currentProjectId}
												currentScope={this.props.currentScope}
												currentElementId={this.props.currentElementId}
												layout={this.state.showDetailed ? 'detail' : 'pile'} 
												elements={elements} 
												orderProp="impactMissing"
												unit="%"
												showMax={4}
												excerpt={!this.state.showMoreMissing}
												handleClick={() => this.setState({ showMoreMissing: !this.state.showMoreMissing })} 
											/>
										</div>
										<div className="col2">
											<div className="description">
												<p>Features with partial support:</p>
											</div>
											<ElementsList
												currentProjectId={this.props.currentProjectId}
												currentScope={this.props.currentScope}
												currentElementId={this.props.currentElementId}
												layout={this.state.showDetailed ? 'detail' : 'pile'} 
												elements={elements} 
												orderProp="impactPartial"
												unit="%"
												showMax={4}
												excerpt={!this.state.showMorePartial}
												handleClick={() => this.setState({ showMorePartial: !this.state.showMorePartial })} 
											/>
										</div>
									</div>
									<div className="description">
										<p>Frequency of the affected Features:</p>
									</div>
									<ElementsChart 
										elements={elements}
										orderProp="count"
									/>
									<FilterList elements={whatifiuse} />
								</div>
							</div>
						</div>
		} else {
			pageElem = <div className="content-container content statistics-container">
							<span>No page selected…</span>
						</div>
		}
		return <StickyContainer>
					{pageElem}
				</StickyContainer>;
	}
}

