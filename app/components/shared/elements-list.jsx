import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default class ElementsList extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array.isRequired,
		orderProp: React.PropTypes.string.isRequired,
		unit: React.PropTypes.string,
		layout: React.PropTypes.string,
		showMax: React.PropTypes.number,
		excerpt: React.PropTypes.bool,
		handleClick: React.PropTypes.func
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	handleClick() {
		if(this.props.handleClick) {
			this.props.handleClick();
		}
	}
	render() {
		const elements = this.props.elements.filter(element => element[this.props.orderProp]) || [];
		const elemLength = elements.length;
		if(elemLength === 0) {
			return <p>No elements</p>
		}
		const layout = this.props.layout;
		const excerpt = this.props.excerpt ? (this.props.showMax < elemLength) : false;
		const maxElems = excerpt ? (this.props.showMax || elemLength) : elemLength;
		const afterElem = this.props.showMax < elemLength ?
						(
							layout === 'pile' ? 
								<div 
									className="pile"
									onClick={this.handleClick.bind(this)}
								>
									<span className="icon-piles"></span>
									<span>{excerpt ? (elemLength - maxElems) : ''}</span>
								</div> : 				
								<button 
									className={classnames('button button--icon button--full ', excerpt && layout !== 'pile' ? 'list-overlay' : '')}
									onClick={this.handleClick.bind(this)}
								>
									<div>
										<span className={excerpt ? 'icon-keyboard_arrow_down' : 'icon-keyboard_arrow_up'}></span>
										<span>{excerpt ? (elemLength - maxElems) : ''}</span>
									</div>
								</button>
						) :
						('');
		return (
			<div className={classnames('elements-list', excerpt ? 'hideLast' : '')}>
				{
					elements
						.sort((a, b) => b[this.props.orderProp] - a[this.props.orderProp])
						.splice(0, maxElems)
						.map((item, index) =>
							{
								return layout !== 'detail' ? (
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
									</div>) :
									(<div key={index} className="box box--element">
										<h3><span className=""></span>{item.title}</h3>
										<span>{item[this.props.orderProp]}{this.props.unit}</span>
									</div>)
							}
				)}
				{afterElem}
			</div>
		);
	}
}

