import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Timeline from './timeline';
import ElementsList from '../../shared/elements-list';
import ElementsChart from '../../shared/elements-chart';
import BrowsersList from '../../shared/browsers-list';

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
		console.log(this);
		let pageElem;
		let timeline;
		if(Object.keys(this.props.page).length > 0) {
			
			if(this.props.snapshots && this.props.snapshots.length > 0) {
			
				const page = this.props.page;
				const snapshots = this.props.snapshots || [];
				let elements = snapshots[snapshots.length - 1].elementCollection || [];

				if(snapshots.length > 1) {
					timeline = <Timeline
									snapshots={snapshots}
									isChecking={page.isChecking || false} 
								/>
				}

				pageElem = 	<div>
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
						</div>;
			} else {
				pageElem = <span>Not investigated yet.</span>;
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

