import React from 'react';
import AltContainer from 'alt-container';

import BrowsersStore from 'stores/browsers-store';
import BrowserBox from './browserbox';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

import {clone, camelCase, flatten, values, find, forEach, uniq, merge, sumBy, groupBy, value, map as _map} from "lodash";
import classnames from 'classnames';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

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
	}
	componentDidMount() {
	}
	render() {
		const scope = this.props.currentScope;
		let browsers = [];
		if(this.props.browserscopes[scope].browsers) {
			browsers = this.props.browserscopes[scope].browsers;
			for (var i = 0; i < browsers.length; i++) {

				let newBrowser = browsers[i];
				newBrowser.completeShare = Object.keys(newBrowser.version_usage).reduce((sum, version) => {
					return sum += newBrowser.version_usage[version];
				}, 0);
				browsers[i] = newBrowser;

			}
			browsers = browsers.sort((a, b) => { 
				return a.completeShare < b.completeShare ? 1 : -1;
			});
		}
		return (
			<div>
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
				<div className="content-container content edged browsertiles-container">
					{browsers && browsers.map((item, index) =>
						<BrowserBox key={index} browser={item} maxVal={browsers[0].completeShare} />
					)}
				</div>
			</div>
		);
	}
}