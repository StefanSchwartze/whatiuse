import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
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
						let messages = [];
						const missing = element.missing.toFixed(2);
						const partial = element.partial.toFixed(2);
						if(missing > 0) {
							messages.push('' + missing + '% less of your users support all features on your site');
						}
						if(partial > 0) {
							messages.push(partial + '% more than before will only partially support it');
						}
						const message = messages.length > 0 ?
							'This means that when you add this feature to your code, ' + messages.join(' and ') :
							'This means that adding this feature to your code would not decrease the browser support for your website.';
						return (
							<Tooltip
								key={index}
								overlayClassName="tooltip--simple"
								placement="top"
								mouseEnterDelay={0}
								mouseLeaveDelay={0}
								destroyTooltipOnHide={true}
								overlay={
									<div style={{maxWidth: 320}}>
										{message}
									</div>
								}
							>
								<div className="box box--tiny">
									<span className="title">{element.name}</span>
									<div className="content">
										<span className="missing">
											M: <strong style={
												{
													color: missing > 0 ? colorpalette(missing, 60, 0, 28, 1) : colorpalette(missing, 120, 0, 28, 1) 
												}}>
													{missing > 0 ? '+' : ''}
													{missing}
													%
												</strong>
										</span>
										<span className="partial">
											P: <strong style={
												{
													color: partial > 0 ? colorpalette(partial, 60, 0, 28, 1) : colorpalette(partial, 120, 0, 28, 1) 
												}}>
													{element.missing > 0 ? '+' : ''}
													{partial}
													%
												</strong>
										</span>
									</div>
								</div>
							</Tooltip>
						);
					})
				}								
			</div>
		);
	}
}

