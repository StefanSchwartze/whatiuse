import React from 'react';
import Modal, {closeStyle} from 'simple-react-modal';
import controllable from 'react-controllables';
import classnames from 'classnames';

import PagesActions from 'actions/pages-actions';

import PageForm from './page-form';
import Page from './page';

@controllable(['currentPageIndex'])
export default class PagesList extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		currentPageIndex: React.PropTypes.number,
		onCurrentPageIndexChange: React.PropTypes.func
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
	close(){
		this.setState({showModal: false})
	}
	setCurrentPageIndex(index) {
		console.log(index);
		if(this.props.onCurrentPageIndexChange) {
			this.props.onCurrentPageIndexChange(index);
		}
	}
	render() {
		return (
			<div className="page-slider">
				<Modal 
					transitionSpeed={250}
					className="modal"
					containerClassName="modal-container"
					closeOnOuterClick={true}
					show={this.state.showModal}
					onClose={this.close.bind(this)} >
					<div className="modal-head">
						<span>Add new page</span>
						<button className="icon-close button button--close" onClick={this.close.bind(this)}></button>
					</div>
					<PageForm focues={true} onSend={this.close.bind(this)} />
				</Modal>
				<div className="pages-head">
					<div className="count">{this.props.pages.length} pages</div>
					<div className="order-switch">
						<span onClick={this.toggleOrder.bind(this, false)} className="icon-keyboard_arrow_down"></span>
						<span onClick={this.toggleOrder.bind(this, true)} className="icon-keyboard_arrow_up"></span>
					</div>
					<button className="button button--yellow" onClick={this.showModal.bind(this)}><span className="icon-add"></span>Add page</button>
				</div>
				<div className={classnames('slider', this.state.rtl ? 'orderReverse' : '')}>
					<div className={classnames('page', 'all', this.props.currentPageIndex === -1 ? 'active' : '')} >
						<div className="page-overlay">
							<div className="percentage">
								<span>
									98%
								</span>
							</div>
							<div className="open">
								<button className="button button--wide button--strong button--yellow" >Open</button>
							</div>
							<div className="title">
								<span>All</span>
							</div>
						</div>
					</div>
					{this.props.pages && this.props.pages.map((item, index) =>
						<Page key={index} page={item} isActive={this.props.currentPageIndex === index} onClick={this.setCurrentPageIndex.bind(this, index)} />
					)}
				</div>
			</div>
		);
	}
}

