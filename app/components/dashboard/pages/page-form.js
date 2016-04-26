import React from 'react';
import { Form } from 'formsy-react';
import TextInput from 'components/shared/form-elements/input';

import connectToStores from 'alt/utils/connectToStores';
import {authDecorator} from 'utils/component-utils';

import PagesActions from 'actions/pages-actions';

export default class PageForm extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array
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
		console.log(model);
	}
	send(e) {
		console.log(e);
		this.refs.pageForm.submit();
	}
	render() {
		var textError = 'Must be a valid URL';
		return (
			<div>
				<Form ref="pageForm" 
					onValidSubmit={this.submit.bind(this)}
					onValid={this.enableButton.bind(this)}
					onInvalid={this.disableButton.bind(this)}>
					<TextInput
						classes=""
						name="page"
						title=""
						type="text"
						validations="isUrl"
						validationError={textError} />
				</Form>
				<button disabled={!this.state.canSubmit} className="button button--wide button--yellow" onClick={this.send.bind(this)}>Add page</button>
			</div>
		);
	}
}