import React from 'react';
import Modal, {closeStyle} from 'simple-react-modal';
import classnames from 'classnames';

import PagesActions from 'actions/pages-actions';

import PageForm from './page-form';
import Page from './page';

export default class PagesList extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		currentPageId: React.PropTypes.string,
		completeSupport: React.PropTypes.string
	}
	constructor(props) {
		super(props);
		this.state = {
			rtl: false,
			showModal: false
		};
	}
	componentWillMount() {
	}
	toggleOrder(rtl) {
		this.setState({rtl: rtl})	
	}
	showModal(){
		this.setState({showModal: true})
	}
	closeModal(){
		this.setState({showModal: false})
	}
	setCurrentPageId() {
		PagesActions.selectPage('all');
	}
	render() {
		let globalTile;
		if(this.props.pages.length > 0) {
			if(this.props.pages.length > 1) {
				globalTile = <div className={classnames('page', 'all', this.props.currentPageId === 'all' ? 'active' : '')} >
							<div className="page-overlay">
								<div className="percentage">
									<span>{this.props.completeSupport || '- '}%</span>
								</div>
								<div className="open">
									<button onClick={this.setCurrentPageId.bind(this)} className="button button--wide button--strong button--accent">Open</button>
								</div>
								<div className="title">
									<span>All</span>
								</div>
							</div>
						</div>
			}
		} else {
			globalTile = <h2 className="hint--empty">No pages added yet.</h2>
		}
		return (
			<div className="page-slider">
				<Modal 
					transitionSpeed={250}
					className="modal"
					containerClassName={classnames('animate', 'modal-container', 'checked')}
					closeOnOuterClick={true}
					show={this.state.showModal}
					onClose={this.closeModal.bind(this)} >
					<div className="modal-head">
						<span>Add new page</span>
						<button className="icon-close button button--close" onClick={this.closeModal.bind(this)}></button>
					</div>
					<PageForm onSend={this.closeModal.bind(this)} />
				</Modal>
				<div className="pages-head">
					<div className="count">{this.props.pages.length} page{this.props.pages.length === 1 ? '' : 's'}</div>
					<div className="order-switch">
						<span onClick={this.toggleOrder.bind(this, false)} className="icon-keyboard_arrow_down"></span>
						<span onClick={this.toggleOrder.bind(this, true)} className="icon-keyboard_arrow_up"></span>
					</div>
					<button className="button button--accent" onClick={this.showModal.bind(this)}><span className="icon-add"></span>Add page</button>
				</div>
				<div className={classnames('slider', this.state.rtl ? 'orderReverse' : '')}>
					{globalTile}
					{this.props.pages && this.props.pages
							/*.sort((a, b) => b.latestSupport - a.latestSupport)*/
							.map((item, index) =>
						<Page key={index} page={item} isActive={this.props.currentPageId === item._id} />)
					}
				</div>
			</div>
		);
	}
}

