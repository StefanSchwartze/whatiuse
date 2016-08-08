import React from 'react';
import AltContainer from 'alt-container';

import BrowsersStore from 'stores/browsers-store';
import BrowserBox from './browserbox';
import BrowserActions from 'actions/browsers-actions';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

@authDecorator
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
		BrowserActions.fetch(this.props.params.scope, this.props.params.id);
		BrowserActions.selectScope(this.props.params.scope);
	}
	render() {
		const scope = this.props.params.scope;
		let browsers = [];
		if(scope && this.props.browserscopes[scope].browsers.length > 0) {
			browsers = this.props.browserscopes[scope].browsers;
			for (var i = 0; i < browsers.length; i++) {

				let newBrowser = browsers[i];
				newBrowser.completeShare = newBrowser.version_usage.reduce((sum, version, index) => {
					return sum += newBrowser.version_usage[index].usage;
				}, 0);
				browsers[i] = newBrowser;

			}
			browsers = browsers.sort((a, b) => { 
				return a.completeShare < b.completeShare ? 1 : -1;
			});
		}
		return (
			<div>
				<div className="browsers-list">
					<div className="content-container edged browser-container">
						<ResponsiveContainer>
							<BarChart 
								data={browsers}
								margin={{top: 20, right: 30, left: 20, bottom: 5}}
							>
								<XAxis dataKey="browser"/>
								<YAxis/>
								<CartesianGrid />
								<Tooltip/>
								<Bar dataKey="completeShare" stackId="a" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="content-container content edged browsertiles-container">
					{browsers && browsers.map((item, index) =>
						<BrowserBox key={index} browser={item} maxVal={browsers[0].completeShare} />
					)}
				</div>
			</div>
		);
	}
}