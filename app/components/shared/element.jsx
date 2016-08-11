import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import Pile from './pile';
import classnames from 'classnames';

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
					<h3><span className=""></span>{this.props.title}</h3>
					<span>{this.props.value}</span>
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
									)
								}
								return browserPiles;
							})}
						</li>
					</ul>
				</div>
			</div>
		)	
	}
}

