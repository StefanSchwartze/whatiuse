import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import { StickyContainer, Sticky } from 'react-sticky';
import { Link, Element, Events, scroll, scrollSpy } from 'react-scroll';
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
	componentDidMount() {
		Events.scrollEvent.register('begin', function(to, element) {
			console.log("begin", arguments);
		});
		Events.scrollEvent.register('end', function(to, element) {
			console.log("end", arguments);
		});
		scrollSpy.update();
	}
	componentWillUnmount() {
		Events.scrollEvent.remove('begin');
		Events.scrollEvent.remove('end');
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
			let whatIfIUseElem;
			let fullSupport = 100;
			let elements;
			let whatifiuse;
			let whatifidelete;
			let content;

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
							<Link 
								activeClass="open" 
								className="box box--element" 
								to="partiallySupportedElements" 
								spy={true} 
								smooth={true} 
								duration={500}
								offset={-80}
							>
								<div className="box-head">
									<PercentagePie 
										value={partialSupport} 
										color="#e0cd28"
									/>
									<h3>Partially supported</h3>
								</div>
							</Link>
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
							<Link 
								activeClass="open" 
								className="box box--element" 
								to="notSupportedElements" 
								spy={true} 
								smooth={true} 
								duration={500}
								offset={-80}
							>
								<div className="box-head">
									<PercentagePie 
										value={missingSupport} 
										color="#bd1010"
									/>
									<h3>Not supported</h3>
								</div>
							</Link>
						</Tooltip>
				}
				if(lastSnapshot.whatIfIDelete) {
					whatifidelete = lastSnapshot.whatIfIDelete;
					whatIfIDeleteElem = 
						<Link 
								activeClass="open" 
								className="box box--element" 
								to="whatIfIDeleteElem" 
								spy={true} 
								smooth={true} 
								duration={500}
							>
							<div className="box-head">
								<h3>{whatifidelete.length} Delete recommendations</h3>
							</div>
						</Link>
				}
				if(lastSnapshot.whatIfIUse) {
					const recommendations = lastSnapshot.whatIfIUse;
					whatIfIUseElem = 
						<Link 
								activeClass="open" 
								className="box box--element" 
								to="whatIfIUseElem" 
								spy={true} 
								smooth={true} 
								duration={500}
								offset={-80}
							>
							<div className="box-head">
								<h3>{whatifiuse.length} Future consequences</h3>
							</div>
						</Link>
				}
				content = <div className="content-container statistics-container">
								<Sticky 
									topOffset={-80}
									stickyStyle={{marginTop: '80px'}}
								>
									<div className="sidebar">
										<div className="description">
											<h1 className="big">Latest result:</h1>
											
											<div className="box box--element">
												<div className="box-head">
													<PercentagePie 
														value={parseFloat(fullSupport.toFixed(2))} 
														color="rgb(71, 191, 109)"
													/>
													<h3>Fully supported</h3>
												</div>
											</div>
											{partialSupportElem}
											{missingSupportElem}
											{whatIfIDeleteElem}
											{whatIfIUseElem}
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
									<Element 
										name="partiallySupportedElements">
										<div className="description">
											<p>Features with partial support:</p>
										</div>
										<ElementsList
											currentProjectId={this.props.currentProjectId}
											currentScope={this.props.currentScope}
											currentElementId={this.props.currentElementId}
											layout={this.state.showDetailed ? 'detail' : 'pile'} 
											elements={elements || []} 
											orderProp="impactPartial"
											unit="%"
											showMax={4}
											excerpt={!this.state.showMorePartial}
											handleClick={() => this.setState({ showMorePartial: !this.state.showMorePartial })} 
										/>
									</Element>
									<Element 
										name="notSupportedElements">
										<div className="description">
											<p>Features with missing support:</p>
										</div>
										<ElementsList 
											currentProjectId={this.props.currentProjectId}
											currentScope={this.props.currentScope}
											currentElementId={this.props.currentElementId}
											layout={this.state.showDetailed ? 'detail' : 'pile'} 
											elements={elements || []} 
											orderProp="impactMissing"
											unit="%"
											showMax={4}
											excerpt={!this.state.showMoreMissing}
											handleClick={() => this.setState({ showMoreMissing: !this.state.showMoreMissing })} 
										/>
									</Element>
									<Element 
										name="whatIfIDeleteElem">
										<div className="description">
											<p>What if I delete?:</p>
										</div>
										{
											whatifidelete && whatifidelete
											.sort((a, b) => (a.cost > b.cost ? 1 : (a.cost < b.cost ? -1 : 0)))
											.map((result, index) => {
												return (
													<div 
														key={index}
														className="box box--element"
													>
														<div className="box-head">
															<PercentagePie 
																value={parseFloat(result.gained_share.toFixed(2))} 
																color="rgb(71, 191, 109)"
															/>
															<h3>{result.collection.map(el => el.name).join(', ')}</h3>
														</div>
													</div>
												)
											})
										}
									</Element>
									<Element 
										name="whatIfIUseElem">
										<FilterList elements={whatifiuse || []} />
									</Element>
									<div className="description">
										<p>Frequency of the affected Features:</p>
									</div>
									<ElementsChart 
										elements={elements || []}
										orderProp="count"
									/>
								</div>
							</div>
			}
			pageElem = <div>
							<Sticky className="statistics-head">
								<div className="timeline-container content-container edged">
									<div className="content-container">
										<Statusbar
											isChecking={page.isChecking || false}
											page={this.props.page}
											lastUpdate={status}
										/>
									</div>
									{timeline}
								</div>
							</Sticky>
							{content}
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

