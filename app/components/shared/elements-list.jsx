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
		if(this.props.elements.length === 0) {
			return <p>No elements</p>
		}
		return (
			<div className="elements-list">
				{this.props.elements && this.props.elements.map((item, index) =>
					<div className="pile" key={index}>
						<span>{item.count}</span><span>|</span><span>{item.name}</span>
					</div>
				)}
			</div>
		);
	}
}

