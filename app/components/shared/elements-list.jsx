import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Pile from './pile';
import ElementBox from './element';
import classnames from 'classnames';
import { Link } from 'react-router';

export default class ElementsList extends React.PureComponent {
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
									<Pile 
										key={index}
										value={item[this.props.orderProp]+this.props.unit}
										title={item.name}
										message={item.message}
									/>) :
									(<ElementBox 
										key={index}
										element={item}
										value={item[this.props.orderProp]+this.props.unit}
										title={item.name}
									/>)
							}
				)}
				{afterElem}
			</div>
		);
	}
}

