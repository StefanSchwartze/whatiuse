import React from 'react';
import Pile from './pile';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import classnames from 'classnames';
import Changes from './changes';
import PercentagePie from './percentagepie';
import colorpalette from 'utils/color-array';

export default class ElementBox extends React.PureComponent {
	static propTypes = {
		element: React.PropTypes.object.isRequired,
		title: React.PropTypes.string.isRequired,
		value: React.PropTypes.string.isRequired,
		showProp: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
	}
	render() {
		const element = this.props.element;
		return(
			<div
				onClick={() => this.setState( { open: !this.state.open })} 
				className={classnames('box box--element ', this.state.open ? 'open' : 'hide')}>
				<div className="box-head">
					<PercentagePie 
						value={parseFloat(this.props.value)} 
						color={this.props.showProp === 'partial' ? '#e0cd28' : '#bd1010'} 
					/>
					<h3>{this.props.title}</h3>
					<span className={!this.state.open ? 'icon-keyboard_arrow_down arrow' : 'icon-keyboard_arrow_up arrow'}></span>
				</div>
				<div className="box-body">
					<ul>
						<li>{this.props.showProp} browsers:<br/>
							{element[this.props.showProp] && element[this.props.showProp].map((browser, index) => {
								let browserPiles = [];
								for (var i = 0; i < browser.version_usage.length; i++) {
									browserPiles.push(
										<Pile 
											size="tiny"
											key={index+i}
											value={browser.version_usage[i].usage.toFixed(2) + '%'}
											title={browser.browser + ' ' + browser.version_usage[i].version}
										/>
									);
								}
								return browserPiles;
							})}
						</li>
						{/*<li>What if I delete?<br/>
							<ul className="mixed-list">
								<li className="mixed-list-item">
									<div className="piles">
										<Pile 
											size="tiny"
											title="this"
										/>
									</div>
									<Changes 
										value={this.props.element.deletePossibilities.self.missing.toFixed(2)}
										type="missing"
										invert={true}
									/>
									<Changes 
										value={this.props.element.deletePossibilities.self.partial.toFixed(2)}
										type="partial"
										invert={true}
									/>
								</li>
								{{this.props.element.deletePossibilities.others && this.props.element.deletePossibilities.others.map((item, index) => {
									let messages = [];
									const missing = item.missing.toFixed(2);
									const partial = item.partial.toFixed(2);
									if(missing > 0) {
										messages.push('' + missing + '% more of your users will fully support all features on your site');
									}
									if(partial > 0) {
										messages.push(partial + '% more than before will fully support it instead of only partially support it');
									}
									const message = messages.length > 0 ?
										'This means that when you remove this/these feature(s) from your code, ' + messages.join(' and ') :
										'This means that adding this/these feature(s) from your code would not improve the browser support for your website.';
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
											<li 
												className="mixed-list-item"
												key={index}>
												<div className="piles">
													<Pile 
														size="tiny"
														title="this"
													/>
													<span> + </span>
													<Pile 
														size="tiny"
														title={item.feature}
													/>
												</div>
												<Changes 
													value={missing}
													type="missing"
													invert={true}
												/>
												<Changes 
													value={partial}
													type="partial"
													invert={true}
												/>
											</li>
										</Tooltip>
									)
								})}}
							</ul>
						</li>*/}
					</ul>
				</div>
			</div>
		)	
	}
}

