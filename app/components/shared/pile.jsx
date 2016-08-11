import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class Pile extends React.PureComponent {
	static propTypes = {
		value: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		message: React.PropTypes.string,
		size: React.PropTypes.string
	}
	constructor(props) {
		super(props);
	}
	render() {
		const message = this.props.message || '';
		console.log(message);
		const content = (<span><span>{this.props.value}</span><span>|</span><span>{this.props.title}</span></span>);
		return(
		<div className={classnames('pile', this.props.size && this.props.size === 'tiny' ? 'tiny' : '')}>
			{
				message !== '' ? 
					<Tooltip
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
					>{content}</Tooltip> :
					content
			}	        
		</div>)	
	}
}

