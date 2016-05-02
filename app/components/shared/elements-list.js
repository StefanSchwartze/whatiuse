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
		console.log(this.props.elements);
		return (
			<div className="elements-list">
				{this.props.elements && this.props.elements.map((item, index) =>
					<div className="pile" key={index}>
						<span>{item.title}</span>
					</div>
				)}
			</div>
		);
	}
}

