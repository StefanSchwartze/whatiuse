import React from 'react';
import ReactDOM from 'react-dom';

export default class Page extends React.Component {
	static propTypes = {
		page: React.PropTypes.object.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
	}
	render() {
		return (
			<div className="page">
				<div className="page-overlay">
					<div className="percentage">
						<span>
							75%
						</span>
					</div>
					<div className="open">
						<button className="button button--wide button--strong button--yellow" >Open</button>
					</div>
					<div className="title">
						<span>{this.props.page.title}</span>
					</div>
				</div>
				<iframe className="page-thumb" src="https://www.sevenval.com" width="1200" height="700"></iframe>
			</div>
		);
	}
}

