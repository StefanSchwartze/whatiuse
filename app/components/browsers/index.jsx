import React from 'react';
import AltContainer from 'alt-container';

import BrowsersStore from 'stores/browsers-store';
import BrowserBox from './browserbox';
import BrowserActions from 'actions/browsers-actions';

import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class Browsers extends React.Component {
	static getStores(props) {
		return [BrowsersStore];
	}
	static getPropsFromStores(props) {
		return BrowsersStore.getState();
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		BrowserActions.fetch(this.props.params.scope, this.props.params.projectid);
		BrowserActions.selectScope(this.props.params.scope);
	}
	render() {
		const scope = this.props.params.scope;
		const currentBrowser = this.props.params.browserid;
		let totalCoverage = 0;
		let browsers = [];
		if(scope && this.props.browserscopes[scope].browsers.length > 0) {
			for (var i = 0; i < this.props.browserscopes[scope].browsers.length; i++) {
				let newBrowser = this.props.browserscopes[scope].browsers[i];
				newBrowser.completeShare = newBrowser.version_usage.reduce((sum, version, index) => {
					const share = version.usage || version.share;
					return sum += share;
				}, 0);
				browsers.push(newBrowser);
				totalCoverage += newBrowser.completeShare;
			}
		}
		return (
			<div>
				<div className="browsers-list">
					<div className="content-container browsers-container">
						<div className="dyn-columns">
							<div className="col2">
								<h1>Browser share of users</h1>
								<h2>from your <strong className="label">{scope}</strong> data scope</h2>
							</div>
							<div className="col2 coverage-title">
								<h1>{totalCoverage.toFixed(2) + '%'}</h1>
								<h3>Total coverage</h3>
							</div>
						</div>
					</div>
				</div>
				{browsers.length > 0 ? 
					browsers
						.sort((a, b) => { return a.completeShare < b.completeShare ? 1 : -1; })
						.map((item, index) => {
							return(
							<BrowserBox 
								key={index} 
								scope={scope}
								isOpen={item.alias === currentBrowser}
								projectId={this.props.params.projectid}
								browser={item} 
								maxVal={browsers[0].completeShare} />
							)
						}
						) : 
					<div className="content-container"><p>No data provided</p></div>
				}
			</div>
		);
	}
}