import React from 'react';
import AltContainer from 'alt/AltContainer';

import PagesList from './pages/pages-list';
import PagesStore from 'stores/pages-store';
import PagesActions from 'actions/pages-actions';

import StatisticsContainer from './statistics/statistics-container';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt/utils/connectToStores';

@authDecorator
@connectToStores
export default class Dashboard extends React.Component {
	static propTypes = {
		item: React.PropTypes.object,
		pages: React.PropTypes.array,
		currentPageId: React.PropTypes.string
	}
	static getStores(props) {
		return [PagesStore];
	}
	static getPropsFromStores(props) {
		return PagesStore.getState();
	}
	constructor(props) {
		super(props);
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
				<div className="content-container edged content slider-container">
					<PagesList 
						pages={this.props.pages}
						currentPageId={this.props.currentPageId} />
				</div>
				<div className="content-container content statistics-container">
					<StatisticsContainer 
						pages={this.props.pages}
						currentPageId={this.props.currentPageId} />
				</div>
			</AltContainer>
		);
	}
}