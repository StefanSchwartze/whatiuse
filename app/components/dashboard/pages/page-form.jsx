import React from 'react';
import { Form } from 'formsy-react';
import TextInput from 'components/shared/form-elements/input';
import PagesActions from 'actions/pages-actions';

export default class PageForm extends React.Component {
	static propTypes = {
		onSend: React.PropTypes.func,
		projectId: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			canSubmit: false
		};
	}
	enableButton() {
		this.setState({
			canSubmit: true
		});
	}
	disableButton() {
		this.setState({
			canSubmit: false
		});
	}
	submit(model) {
		model.title = model.title || 'Home';
		model.url = model.url || 'http://sevenval.com';
		model.elementsCollections = model.elementsCollections || [];
		model.projectId = this.props.projectId;
		PagesActions.add(model);
		if(this.props.onSend) {
			this.props.onSend('Page added');
		}
	}
	send() {
		this.refs.pageForm.submit();
	}
	render() {
		return (
			<div>
				<Form ref="pageForm" 
					onValidSubmit={this.submit.bind(this)}
					onValid={this.enableButton.bind(this)}
					onInvalid={this.disableButton.bind(this)}>
					<TextInput
						autofocus={true}
						placeholder="Title"
						classes=""
						name="title"
						title=""
						type="text"
						validations="minLength:3"
						validationError={'Must be longer than 3 characters'} />
					<TextInput
						placeholder="URL"
						classes=""
						name="url"
						title=""
						type="text"
						validations="isUrl"
						validationError={'Must be a valid URL'} />
				</Form>
				<button disabled={!this.state.canSubmit} className="button button--full button--accent" onClick={this.send.bind(this)}>Add page</button>
			</div>
		);
	}
}