import React from 'react';
import ReactDOM from 'react-dom';

import classnames from 'classnames';

export default class BrowsersBox extends React.Component {
	static propTypes = {
		browser: React.PropTypes.object.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			open: false
		};
	}
	render() {
		console.log(this.props);
		return (
			<div>
				<div
					className="browserbox"
					onClick={() => this.setState({ open: !this.state.open })}
				>
					<p>{this.props.browser.name}</p>
				</div>
				<div className={classnames('browser-detail', this.state.open ? 'open' : '')}>
					<div className="content-container">
						<p>Here we show details about each browser version.
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint </p>
					</div>
				</div>
			</div>
		);
	}
}

