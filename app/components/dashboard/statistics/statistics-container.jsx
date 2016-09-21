import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Timeline from './timeline';
import classnames from 'classnames';
import PercentagePie from '../../shared/percentagepie';
import FilterList from '../../shared/filterable-list';
import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';
import ElementsChart from '../../shared/elements-chart';
import ProgressBar from '../../shared/progressbar';


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
		let progressbar;
		if(Object.keys(this.props.page).length > 0) {
			
			if(this.props.page.isChecking) {
				progressbar = <ProgressBar progress={this.props.page.progress} />;
			}

			if(this.props.snapshots && this.props.snapshots.length > 0) {
			
				const page = this.props.page;
				const snapshots = this.props.snapshots || [];
				const lastSnapshot = snapshots[snapshots.length - 1];
				const elements = lastSnapshot.elementCollection || [];
				const whatifiuse = lastSnapshot.whatIfIUse;
				let partialSupportElem;
				let missingSupportElem;
				let fullSupport = 100;

				if(snapshots.length > 1) {
					timeline = <Timeline
									snapshots={snapshots}
									isChecking={page.isChecking || false}
									length={snapshots.length}
								/>
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

				pageElem = 	<div>
							{progressbar}
							{timeline}
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
							</div>
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
			} else {
				pageElem = <div>
							{progressbar}
							<span>Not investigated yet.</span>
							</div>;
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

