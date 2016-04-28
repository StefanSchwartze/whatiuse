import { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class StatisticsContainer extends Component {
	static propTypes = {
		page: PropTypes.object.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
	}
	render() {
		return (
			<div className="">
			hihi
			</div>
		);
	}
}

