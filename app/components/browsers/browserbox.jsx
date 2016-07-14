import React from 'react';
import ReactDOM from 'react-dom';

import classnames from 'classnames';

export default class BrowsersBox extends React.Component {
	static propTypes = {
		browser: React.PropTypes.object.isRequired,
		maxVal: React.PropTypes.number.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			open: false
		};
	}
	render() {
		console.log(this.props);
		let width = (this.props.browser.completeShare / this.props.maxVal) * 100 + '%';
		return (
			<div>
				<div className="browser-container">
					<div
						className="browserbox"
						onClick={() => this.setState({ open: !this.state.open })}
					>
						<h3><span className={classnames('icon-' + this.props.browser.alias)}></span>{this.props.browser.browser}</h3>
					</div>
					<div className="separator"></div>
					<div
						className="percentagebox"
					>
						<div className="percentagebox-content" style={{width: width}}>
							{this.props.browser.version_usage && Object.keys(this.props.browser.version_usage).map((item, index) =>
								<div className="browser-version" key={index} style={{width: (this.props.browser.version_usage[item] / this.props.browser.completeShare) * 100 + '%'}}></div>
							)}
						</div>

					</div>
				</div>
				<div className={classnames('browser-detail', this.state.open ? 'open' : '')}>
					<div className="content-container">
						<h2>Wow, this information is so detailed!</h2>
						<p>Here we show details about each browser version.
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint </p>
					</div>
				</div>
			</div>
		);
	}
}

