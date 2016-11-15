import React from 'react';
import Modal from 'simple-react-modal';
import classnames from 'classnames';
import PageForm from './page-form';
import Page from './page';
import PagesActions from 'actions/pages-actions';

export default class PagesList extends React.Component {
	static propTypes = {
		currentProjectId: React.PropTypes.string.isRequired,
		pages: React.PropTypes.array.isRequired,
		currentPageId: React.PropTypes.string.isRequired,
		currentScope: React.PropTypes.string.isRequired,
		isLoading: React.PropTypes.bool.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			rtl: false,
			showModal: false
		};
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
	render() {
		let content;
		if(this.props.pages.length > 0) {
			content = this.props.pages
				.sort((pageA, pageB) => {
					if(this.state.rtl) {
						return pageA[this.props.currentScope + 'Support'] < pageB[this.props.currentScope + 'Support'] ? 1 : -1; 
					} else {
						return pageA[this.props.currentScope + 'Support'] > pageB[this.props.currentScope + 'Support'] ? 1 : -1; 
					}
				})
				.map((page, index) =>
					<Page 
						key={index} 
						scope={this.props.currentScope} 
						page={page} 
						isActive={this.props.currentPageId === page._id} 
					/>
				);
		} else if(this.props.isLoading) {
			content = <div className="hinty"><h2 className="hint--empty">Loading...</h2></div>
		} else {
			content = <div className="hinty"><h2 className="hint--empty">No pages added yet.</h2></div>
		}
		return (
			<div className="slider-container">
				<Modal 
					transitionSpeed={250}
					className="modal"
					containerClassName={classnames('animate', 'modal-container', 'checked')}
					closeOnOuterClick={true}
					show={this.state.showModal}
					onClose={this.closeModal.bind(this)} >
					<div className="modal-head">
						<span>Add new page</span>
						<button 
							className="icon-close button button--close" 
							onClick={this.closeModal.bind(this)}
						>
						</button>
					</div>
					<PageForm 
						projectId={this.props.currentProjectId} 
						onSend={this.closeModal.bind(this)} 
					/>
				</Modal>
				<div className="pages-head content-container">
					<div className="count">{this.props.pages.length} page{this.props.pages.length === 1 ? '' : 's'}</div>
					<div className="order-switch">
						<span onClick={this.toggleOrder.bind(this, false)} className="icon-keyboard_arrow_down"></span>
						<span onClick={this.toggleOrder.bind(this, true)} className="icon-keyboard_arrow_up"></span>
					</div>
					<button className="button button--accent" onClick={this.showModal.bind(this)}>Add page</button>
				</div>
				<div className="page-slider">
					{content}
				</div>
			</div>
		);
	}
}

