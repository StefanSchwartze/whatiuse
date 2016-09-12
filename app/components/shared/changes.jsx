import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import colorpalette from 'utils/color-array';

export default class Changes extends React.PureComponent {
	static propTypes = {
		value: React.PropTypes.object.isRequired,
		type: React.PropTypes.string.isRequired,
		invert: React.PropTypes.bool
	}
	constructor(props) {
		super(props);
	}
	render() {
		const value = this.props.value;
		const type = this.props.type;
		const label = type === 'missing' ? 'M' : 'P';
		return(
			<span className={type}>
				{label}: <strong style={
					{
						color: value > 0 ? colorpalette(value, 60, 0, 28, 1) : colorpalette(value, 120, 0, 28, 1) 
					}
				}>
					{value > 0 ? '+' : ''}
					{value}
					%
				</strong>
			</span>
		)	
	}
}

