import React from 'react';

import connectToStores from 'alt/utils/connectToStores';
import {authDecorator} from 'utils/component-utils';

import PagesActions from 'actions/pages-actions';

import PageForm from './page-form';
import Page from './page';

export default class PagesList extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
	}
	render() {
		return (
			<div className="page-slider">
				{this.props.pages && this.props.pages.map((item, index) =>
					<Page key={index} page={item} />
				)}
				<div>
					<PageForm />
				</div>
			</div>
		);
	}
}

