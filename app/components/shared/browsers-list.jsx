import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

export default class BrowsersList extends React.PureComponent {
	static propTypes = {
		browsers: React.PropTypes.array
	}
	render() {
		if(this.props.browsers.length === 0) {
			return <p>No browsers</p>
		}
		return (
			<div className="browsers-list">
				{this.props.browsers && this.props.browsers.map((item, index) =>
					<div key={index} className="pile">
						<span className={classnames('icon-' + item.slug)}></span><span>{item.title} | {item.version}</span>
					</div>
				)}
			</div>
		);
	}
}

