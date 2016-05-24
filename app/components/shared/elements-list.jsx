import React from 'react';
import ReactDOM from 'react-dom';
import {floor} from 'lodash';

export default class ElementsList extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array,
		orderProp: React.PropTypes.string,
		unit: React.PropTypes.string
	}
	constructor(props) {
		super(props);
	}
	render() {
		if(this.props.elements.length === 0) {
			return <p>No elements</p>
		}
		//console.log(this.props);
		return (
			<div className="elements-list">
				{this.props.elements && this.props.elements.sort((a, b) => b[this.props.orderProp] - a[this.props.orderProp]).map((item, index) =>
					<div className="pile" key={index}>
						<span>{floor(item[this.props.orderProp], 1)}{this.props.unit}</span><span>|</span><span>{item.name}</span>
					</div>
				)}
			</div>
		);
	}
}

