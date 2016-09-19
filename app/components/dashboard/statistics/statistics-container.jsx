import React from 'react';
import ReactDOM from 'react-dom';
import Timeline from './timeline';
import FilterList from '../../shared/filterable-list';
import ElementsList from '../../shared/elements-list';
import BrowsersList from '../../shared/browsers-list';
import ElementsChart from '../../shared/elements-chart';
import ProgressBar from '../../shared/progressbar';

import classnames from 'classnames';

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
				const elements = snapshots[snapshots.length - 1].elementCollection || [];
				const whatifiuse = snapshots[snapshots.length - 1].whatIfIUse;

				if(snapshots.length > 1) {
					timeline = <Timeline
									snapshots={snapshots}
									isChecking={page.isChecking || false} 
								/>
				}

				pageElem = 	<div>
							{progressbar}
							{timeline}
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

