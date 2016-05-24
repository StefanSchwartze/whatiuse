import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import {floor} from 'lodash';

import PagesActions from 'actions/pages-actions';

export default class Page extends React.Component {
	static propTypes = {
		page: React.PropTypes.object.isRequired,
		isActive: React.PropTypes.bool.isRequired
	}
	constructor(props) {
		super(props);
		this.state = { isLoading: true };
	}
	componentDidMount() {
		this.refs.iframe.addEventListener('load', this.onLoad.bind(this));
	}
	onLoad() {
		this.setState({ isLoading: false });
	}
	setActive() {
		PagesActions.selectPage(this.props.page._id);
	}
	checkUrl() {
		PagesActions.checkURL(this.props.page);
	}
	render() {
		let support = '- %';
		let state;
		if(this.props.page.snapshots && this.props.page.snapshots.length > 0) {
			support = floor(this.props.page.snapshots[this.props.page.snapshots.length - 1].pageSupport, 2) + '%';
		}
		state = <span>{support}</span>;
		if(this.props.page.isChecking) {
			state = <span><i className="icon icon-spinner8 animate rotate"></i>Loading…</span>;
		}
		return (
			<div className={classnames('page', this.props.page.isChecking ? 'isChecking' : '', this.props.isActive ? 'active' : '', this.state.isLoading ? 'isLoading' : '')}>
				<div className="page-overlay">
					<div className="percentage">
						{state}
					</div>
					<div className="open">
						<button onClick={this.setActive.bind(this)} className="button button--wide button--strong button--yellow" >Open</button>
						<button onClick={this.checkUrl.bind(this)} className="button button--wide button--strong button--red" >CHECK</button>
					</div>
					<div className="title">
						<span>{this.props.page.title}</span>
					</div>
				</div>
				<iframe ref="iframe" className="page-thumb" src={this.props.page.url} width="1200" height="700"></iframe>
			</div>
		);
	}
}

