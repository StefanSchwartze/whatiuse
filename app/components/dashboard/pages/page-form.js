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
		model.title = model.title || 'Home';
		model.url = model.url || 'http://sevenval.com';
		model.elementsCollections = model.elementsCollections || [
			{
				elementCollection: [
					{
						name: 'flexbox',
						share: 0.1
					}
				]
			}
		];
		PagesActions.add(model);
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
				<button disabled={!this.state.canSubmit} className="button button--full button--yellow" onClick={this.send.bind(this)}>Add page</button>
			</div>
		);
	}
}