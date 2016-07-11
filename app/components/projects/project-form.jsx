import React from 'react';
import { Form } from 'formsy-react';
import TextInput from 'components/shared/form-elements/input';
import ProjectsActions from 'actions/projects-actions';

export default class ProjectForm extends React.Component {
	static propTypes = {
		onSend: React.PropTypes.func
	}
	constructor(props) {
		super(props);
		this.state = { canSubmit: false };
	}
	submit(model) {
		model.title = model.title || 'Home';
		model.url = model.url || 'http://sevenval.com';
		ProjectsActions.add(model);
		if(this.props.onSend) {
			this.props.onSend('Project added');
		}
	}
	send() {
		this.refs.projectForm.submit();
	}
	render() {
		return (
			<div>
				<Form ref="projectForm" 
					onValidSubmit={this.submit.bind(this)}
					onValid={() => this.setState({ canSubmit: true })}
					onInvalid={() => this.setState({ canSubmit: false })}>
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
				<button disabled={!this.state.canSubmit} className="button button--full button--accent" onClick={this.send.bind(this)}>Add project</button>
			</div>
		);
	}
}