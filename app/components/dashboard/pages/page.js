import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import PagesActions from 'actions/pages-actions';

export default class Page extends React.Component {
	static propTypes = {
		page: React.PropTypes.object.isRequired,
		isActive: React.PropTypes.bool.isRequired
	}
	constructor(props) {
		super(props);
	}
	setActive() {
		PagesActions.selectPage(this.props.page._id);
	}
	render() {
		return (
			<div className={classnames('page', this.props.isActive ? 'active' : '')}>
				<div className="page-overlay">
					<div className="percentage">
						<span>
							75%
						</span>
					</div>
					<div className="open">
						<button onClick={this.setActive.bind(this)} className="button button--wide button--strong button--yellow" >Open</button>
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
