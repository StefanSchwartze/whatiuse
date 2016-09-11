import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import colorpalette from 'utils/color-array';

export default class FilterList extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array.isRequired,
	}
	constructor(props) {
		super(props);
		this.state = {
			filter: ''
		}
	}
	render() {
		const elements = this.props.elements;
		return (
			<div className="boxlist">
				{
					elements && elements.map((element, index) => 
					{
						return (
							<div className="box box--tiny" key={index}>
								<span className="title">{element.name}</span>
								<div className="content">
									<span className="missing">
										M: <strong style={
											{
												color: element.missing.toFixed(2) > 0 ? colorpalette(element.missing, 60, 0, 28, 1) : colorpalette(element.missing, 120, 0, 28, 1) 
											}}>
												{element.missing > 0 ? '+' : ''}
												{element.missing.toFixed(2)}
												%
											</strong>
									</span>
									<span className="partial">
										P: <strong style={
											{
												color: element.partial.toFixed(2) > 0 ? colorpalette(element.partial, 60, 0, 28, 1) : colorpalette(element.partial, 120, 0, 28, 1) 
											}}>
												{element.missing > 0 ? '+' : ''}
												{element.partial.toFixed(2)}
												%
											</strong>
									</span>
								</div>
							</div>
						);
					})
				}								
			</div>
		);
	}
}

