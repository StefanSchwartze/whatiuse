import React from 'react';

import connectToStores from 'alt/utils/connectToStores';
import {authDecorator} from 'utils/component-utils';

import PagesActions from 'actions/pages-actions';

export default class PagesList extends React.Component {
	static contextTypes = {
		router: React.PropTypes.func
	}
	static willTransitionTo(transition) {
		console.log(transition);
	}
	static propTypes = {
		pages: React.PropTypes.array
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
	}
	submit(model) {
		console.log(model);
		//TasksActions.add(model);
	}
	send(test) {
		console.log(test);
		this.refs.taskForm.submit();
	}
	render() {
		return (
			<div>
				<ul className="">
					{this.props.pages && this.props.pages.map((item, index) =>
						<li key={index} className="">
							<h2>{item.title}</h2>
						</li>
					)}
					<li className="">
						<h2>Title</h2>
					</li>
				</ul>
			</div>
		);
	}
}

