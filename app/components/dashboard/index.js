import React from 'react';
import AltContainer from 'alt/AltContainer';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt/utils/connectToStores';

@authDecorator
@connectToStores
export default class Dashboard extends React.Component {
	static willTransitionTo(transition) {
		console.log(transition);
	}
	static contextTypes = {
		router: React.PropTypes.func
	}
	static propTypes = {
		item: React.PropTypes.object,
		pages: React.PropTypes.array,
		pagesHash: React.PropTypes.object
	}
	static getStores(props) {
		return [PagesStore];
	}
	static getPropsFromStores(props) {
		return PagesStore.getState();
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		return PagesActions.fetch();
	}
	render() {
		return (
			<AltContainer
				stores={{
					PagesStore: PagesStore
				}}>
				<div className="content-container edged content">
					<PagesList pages={this.props.pages} />
				</div>
			</AltContainer>
		);
	}
}