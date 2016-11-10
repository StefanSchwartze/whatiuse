import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import classnames from 'classnames';
import colorpalette from 'utils/color-array';

export default class SearchField extends React.PureComponent {
	static propTypes = {
		text: React.PropTypes.string.isRequired,
		handleSearch: React.PropTypes.func.isRequired
	}
	constructor(props) {
		super(props);
	}
	filter(event) {
		event.preventDefault();
		this.props.handleSearch(event.target.value);
	}

	render() {
		const elements = this.props.elements;
		const text = this.props.text;
		return (
			<input
				value={text}
				type="text"
				className="input"
				onChange={ this.filter.bind(this) }
				placeholder="Search" 
			/>
		);
	}
}

