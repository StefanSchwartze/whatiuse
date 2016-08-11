import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class ElementBox extends React.Component {
	static propTypes = {
		element: React.PropTypes.object.isRequired,
		title: React.PropTypes.string.isRequired,
		value: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		const element = this.props.element;
		return(
			<div>
				<div className="box box--element">
					<h3><span className=""></span>{this.props.title}</h3>
					<span>{this.props.value}</span>
				</div>
			</div>
		)	
	}
}

