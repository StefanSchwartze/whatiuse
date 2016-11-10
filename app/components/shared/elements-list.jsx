import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Pile from './pile';
import ElementBox from './element';
import classnames from 'classnames';
import { Link } from 'react-router';

import Changes from './changes';

import PercentagePie from './percentagepie';
import colorpalette from 'utils/color-array';


export default class ElementsList extends React.PureComponent {
	static propTypes = {
		elements: React.PropTypes.array.isRequired,
		type: React.PropTypes.oneOf(['FEATURE', 'RECOMMENDATION', 'CONSEQUENCE']).isRequired,
		orderProp: React.PropTypes.string.isRequired,
		orderDesc: React.PropTypes.bool,
		filterProp: React.PropTypes.string,
		layout: React.PropTypes.string,
		showMax: React.PropTypes.number,
		excerpt: React.PropTypes.bool,
		handleClick: React.PropTypes.func,
		header: React.PropTypes.element,
		filter: React.PropTypes.string
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
		const orderDesc = this.props.orderDesc || false;
		const filter = this.props.filter || '';
		const orderProp = this.props.orderProp;
		const filterProp = this.props.filterProp || orderProp;
		const elements = this.props.elements.filter(element => 
			element[orderProp] && 
			(filter.length > 0 ? element[filterProp].search(new RegExp(filter, 'i')) > -1 : true)) || 
			[];
		const elemLength = elements.length;
		if(elemLength === 0) {
			return <p>No elements</p>
		}
		const type = this.props.type;
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
			<div>
				{this.props.header || ''}
				<div className={classnames('elements-list', excerpt ? 'hideLast' : '')}>
					{
						elements
							.sort((a, b) => orderDesc ? b[orderProp] - a[orderProp] : a[orderProp] - b[orderProp])
							.splice(0, maxElems)
							.map((item, index) =>
								{
									let elem;
									if(layout !== 'detail') {
										elem = <Pile 
													key={index}
													unit="%"
													value={item[orderProp]}
													title={item.name}
													message={item.message}
												/>;
									} else {
										switch(type) {
											case 'FEATURE':
												elem = <ElementBox 
															key={index}
															element={item}
															value={item[orderProp]}
															title={item.title}
															showProp={orderProp === 'impactMissing' ? 'missing' : 'partial'}
														/>;
												break;
											case 'RECOMMENDATION':
												elem = <div 
															key={index}
															className="box box--element"
														>
															<div className="box-head">
																<PercentagePie 
																	value={parseFloat(item.gained_share.toFixed(2))} 
																	color="rgb(71, 191, 109)"
																/>
																<h3>{item.title}</h3>
															</div>
														</div>;
												break;
											case 'CONSEQUENCE':
												let messages = [];
												const missing = item.missing.toFixed(2);
												const partial = item.partial.toFixed(2);
												if(missing > 0) {
													messages.push('' + missing + '% less of your users support all features on your site');
												}
												if(partial > 0) {
													messages.push(partial + '% more than before will only partially support it');
												}
												const message = messages.length > 0 ?
													'This means that when you add this feature to your code, ' + messages.join(' and ') :
													'This means that adding this feature to your code would not decrease the browser support for your website.';
												elem = <Tooltip
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
																<span className="title">{item.name}</span>
																<div className="">
																	<Changes 
																		value={missing}
																		type={'missing'}
																	/>
																	<Changes 
																		value={partial}
																		type={'partial'}
																	/>
																</div>
															</div>
														</Tooltip>;
												break;
										}
									}
									return elem;
								}
					)}
					{afterElem}
				</div>
			</div>
		);
	}
}

