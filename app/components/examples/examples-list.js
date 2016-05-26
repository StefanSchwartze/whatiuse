import React from 'react';

import connectToStores from 'alt-utils/lib/connectToStores';
import {authDecorator} from 'utils/component-utils';

import ExamplesStore from 'stores/examples-store';
import ExamplesActions from 'actions/examples-actions';

@authDecorator
@connectToStores
export default class ExamplesList extends React.Component {
	static contextTypes = {
		router: React.PropTypes.func
	}
	static propTypes = {
		item: React.PropTypes.object,
		examples: React.PropTypes.array,
		examplesHash: React.PropTypes.object,
		showRoute: React.PropTypes.string
	}
	static getStores(props) {
		return [ExamplesStore];
	}
	static getPropsFromStores(props) {
		return ExamplesStore.getState();
	}
	static willTransitionTo(transition) {
		console.log(transition);
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		return ExamplesActions.fetch();
	}
	render() {
		return (
			<div>
				<ul className="">
					{this.props.examples && this.props.examples.map((item, index) =>
						<li key={index} className="">
							<h2>{item.title}</h2>
						</li>
					)}
				</ul>
			</div>
		);
	}
}

