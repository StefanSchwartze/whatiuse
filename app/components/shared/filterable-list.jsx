import React from 'react';
import ReactDOM from 'react-dom';
import Tooltip from 'rc-tooltip';
import classnames from 'classnames';
import Changes from './changes';
import colorpalette from 'utils/color-array';

export default class FilterList extends React.PureComponent {
	static propTypes = {
		elements: React.PropTypes.array.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			filter: ''
		}
	}

	setFilter(event) {
		event.preventDefault();
		this.setState({ filter: new RegExp(event.target.value, 'i') });
	}

	render() {
		const elements = this.props.elements;
		const filter = this.state.filter;
		return (
			<div className="boxlist">
				<div className="description">
					<p>What if I use?:</p>
					<input
			          type="text"
			          className="input"
			          onChange={ this.setFilter.bind(this) }
			          placeholder="Search" />
				</div>
				{
					elements && elements
					.filter(element => element.name.search(filter) > -1)
					.map((element, index) => {
						let messages = [];
						const missing = element.missing.toFixed(2);
						const partial = element.partial.toFixed(2);
						if(missing > 0) {
							messages.push('' + missing + '% less of your users support all features on your site');
						}
						if(partial > 0) {
							messages.push(partial + '% more than before will only partially support it');
						}
						const message = messages.length > 0 ?
							'This means that when you add this feature to your code, ' + messages.join(' and ') :
							'This means that adding this feature to your code would not decrease the browser support for your website.';
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
								<div className="box box--tiny">
									<span className="title">{element.name}</span>
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
							</Tooltip>
						);
					})
				}								
			</div>
		);
	}
}

