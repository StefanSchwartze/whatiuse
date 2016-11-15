import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import { StickyContainer, Sticky } from 'react-sticky';
import { Link, Element, Events, scroll, scrollSpy } from 'react-scroll';
import Timeline from './timeline';
import classnames from 'classnames';
import PercentagePie from '../../shared/percentagepie';
import FilterList from '../../shared/filterable-list';
import SearchField from '../../shared/form-elements/search-field';
import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';
import ElementsChart from '../../shared/elements-chart';
import Statusbar from './statusbar';

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
			showMorePartial: false,
			showMoreDelete: false,
			showMoreUse: false,
			showTimeline: false,
			filter: ''
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

			if(snapshots.length > 0) {
			
				const lastSnapshot = snapshots[snapshots.length - 1];
				elements = lastSnapshot.elementCollection || [];
				whatifiuse = lastSnapshot.whatIfIUse;
				status = lastSnapshot.captured;

				// if(snapshots.length > 1) {
				// 	timeline = 	<DetailTimeline
				// 					snapshots={snapshots}
				// 				/>
				// }
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
								className="box box--element nav-box" 
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
								className="box box--element nav-box" 
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
								className="box box--element nav-box" 
								to="whatIfIDeleteElem" 
								spy={true} 
								smooth={true} 
								duration={500}
							>
							<div className="box-head">
								<span>{whatifidelete.length}</span>
								<h3>Delete recommendations</h3>
							</div>
						</Link>
				}
				if(lastSnapshot.whatIfIUse) {
					const recommendations = lastSnapshot.whatIfIUse;
					whatIfIUseElem = 
						<Link 
								activeClass="open" 
								className="box box--element nav-box" 
								to="whatIfIUseElem" 
								spy={true} 
								smooth={true} 
								duration={500}
								offset={-80}
							>
							<div className="box-head">
								<span>{whatifiuse.length}</span>
								<h3>Future consequences</h3>
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
										<SearchField
											text={this.state.filter}
											handleSearch={(filter) => this.setState({ filter })}
										/>
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
											type="FEATURE"
											layout={this.state.showDetailed ? 'detail' : 'pile'} 
											elements={elements} 
											orderProp="impactPartial"
											orderDesc={true}
											showMax={3}
											excerpt={!this.state.showMorePartial}
											handleClick={() => this.setState({ showMorePartial: !this.state.showMorePartial })} 
											filter={this.state.filter}
											filterProp="title"
										/>
									</Element>
									<Element 
										name="notSupportedElements">
										<div className="description">
											<p>Features with missing support:</p>
										</div>
										<ElementsList
											type="FEATURE"
											layout={this.state.showDetailed ? 'detail' : 'pile'} 
											elements={elements} 
											orderProp="impactMissing"
											orderDesc={true}
											showMax={3}
											excerpt={!this.state.showMoreMissing}
											handleClick={() => this.setState({ showMoreMissing: !this.state.showMoreMissing })} 
											filter={this.state.filter}
											filterProp="title"
										/>
									</Element>
									<Element 
										name="whatIfIDeleteElem">
										<div className="description">
											<p>What if I delete?:</p>
										</div>
										<ElementsList
											type="RECOMMENDATION"
											layout={'detail'} 
											elements={whatifidelete} 
											orderProp="cost"
											showMax={3}
											excerpt={!this.state.showMoreDelete}
											handleClick={() => this.setState({ showMoreDelete: !this.state.showMoreDelete })} 
											filter={this.state.filter}
											filterProp="title"
										/>
									</Element>
									<Element 
										name="whatIfIUseElem">
										<div className="description">
											<p>What if I use?:</p>
										</div>
										<ElementsList
											type="CONSEQUENCE"
											layout={'detail'} 
											elements={whatifiuse} 
											orderProp="name"
											showMax={3}
											excerpt={!this.state.showMoreUse}
											handleClick={() => this.setState({ showMoreUse: !this.state.showMoreUse })} 
											filter={this.state.filter}
										/>
									</Element>
									<div className="description">
										<p>Frequency of the affected Features:</p>
									</div>
									<ElementsChart 
										elements={elements}
										orderProp="count"
									/>
								</div>
							</div>
			}
			pageElem = <div>
							<Sticky className="statistics-head">
								<Statusbar
									isChecking={page.isChecking || false}
									page={this.props.page}
									lastUpdate={status}
									snapshots={snapshots}
									showTimeline={this.state.showTimeline}
									onShowTimelineClick={() => this.setState({ showTimeline: !this.state.showTimeline })} 
								/>
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

