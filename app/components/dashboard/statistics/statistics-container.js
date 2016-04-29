import React from 'react';
import ReactDOM from 'react-dom';

import connectToStores from 'alt/utils/connectToStores';
import StatusStore from 'stores/status-store';
import StatusActions from 'actions/status-actions';

@connectToStores
export default class StatisticsContainer extends React.Component {
	static propTypes = {
		page: React.PropTypes.object
	}
	static getStores() {
		return [
			StatusStore
		];
	}
	static getPropsFromStores() {
		return StatusStore.getState();
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
	}
	render() {
		let page;

		if(this.props.page && !this.props.busy) {
			page = <span>Hi</span>;
		} else {
			page = <span>Loading...</span>;
		}
		return (
			<div className="">
				{page}
			</div>
		);
	}
}

