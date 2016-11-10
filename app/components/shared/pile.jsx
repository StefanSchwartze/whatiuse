import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class Pile extends React.PureComponent {
	static propTypes = {
		title: React.PropTypes.string.isRequired,
		unit: React.PropTypes.string,
		value: React.PropTypes.string,
		message: React.PropTypes.string,
		size: React.PropTypes.string
	}
	constructor(props) {
		super(props);
	}
	render() {
		const message = this.props.message || '';
		const title = this.props.title;
		const content = (<span>
							<span>{this.props.value}{this.props.unit ? this.props.unit : ''}</span>
							{this.props.value ? <span>|</span> : ''}
							<span>{title}</span>
						</span>);
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
							<div style={{maxWidth: 300}}>
								{message}
							</div>
						}
					>{content}</Tooltip> :
					content
			}	        
		</div>)	
	}
}

