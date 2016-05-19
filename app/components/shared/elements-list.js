import React from 'react';
import ReactDOM from 'react-dom';

export default class ElementsList extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array
	}
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="elements-list">
				{this.props.elements && this.props.elements.map((item, index) =>
					<div className="pile" key={index}>
						<span>{item.count}</span><span>{item.name}</span>
					</div>
				)}
			</div>
		);
	}
}

