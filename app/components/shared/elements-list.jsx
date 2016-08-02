import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';

export default class ElementsList extends React.PureComponent {
	static propTypes = {
		elements: React.PropTypes.array,
		orderProp: React.PropTypes.string,
		unit: React.PropTypes.string
	}
	render() {
		if(this.props.elements.length === 0) {
			return <p>No elements</p>
		}
		return (
			<div className="elements-list">
				{this.props.elements && this.props.elements.sort((a, b) => b[this.props.orderProp] - a[this.props.orderProp]).map((item, index) =>
					<div className="pile" key={index}>
						<Tooltip
							overlayClassName="tooltip--simple"
							placement="top"
							mouseEnterDelay={0}
							mouseLeaveDelay={0}
							destroyTooltipOnHide={true}
							overlay={
								<div style={{maxWidth: 320}}>
									{item.message}
								</div>
							}
						>
							<span><span>{item[this.props.orderProp]}{this.props.unit}</span><span>|</span><span>{item.name}</span></span>
				        </Tooltip>
					</div>
				)}
			</div>
		);
	}
}

