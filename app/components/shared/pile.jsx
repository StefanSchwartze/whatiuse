import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class Pile extends React.Component {
	static propTypes = {
		value: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		message: React.PropTypes.string,
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		return(
		<div className="pile">
			<Tooltip
				overlayClassName="tooltip--simple"
				placement="top"
				mouseEnterDelay={0}
				mouseLeaveDelay={0}
				destroyTooltipOnHide={true}
				overlay={
					<div style={{maxWidth: 320}}>
						{this.props.message}
					</div>
				}
			>
				<span><span>{this.props.value}</span><span>|</span><span>{this.props.title}</span></span>
	        </Tooltip>
		</div>)	
	}
}

