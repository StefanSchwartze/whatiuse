import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class ElementsList extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array.isRequired,
		orderProp: React.PropTypes.string.isRequired,
		unit: React.PropTypes.string
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		if(this.props.elements.length === 0) {
			return <p>No elements</p>
		}
		return (
			<div className="elements-list">
				{
					this.props.elements && 
					this.props.elements
						.filter(element => element[this.props.orderProp])
						.sort((a, b) => b[this.props.orderProp] - a[this.props.orderProp])
						.map((item, index) =>
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

