import React from 'react';
import AltContainer from 'alt-container';

import BrowsersStore from 'stores/browsers-store';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

import classnames from 'classnames';

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
		//return PagesActions.fetch();
	}
	componentDidMount() {
	}
	render() {
		const scope = this.props.currentScope;
		const browsers = this.props.browserscopes[scope].browsers;
		console.log(browsers);
		return (
			<div>
				{browsers && browsers.map((item, index) =>
					<div key={index} className="pile">
						<span className={classnames('icon-' + item.name)}></span><span>{item.name} | {item.version}</span>
					</div>
				)}
			</div>
		);
	}
}