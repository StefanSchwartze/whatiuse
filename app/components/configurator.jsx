import React from 'react';
import { Form } from 'formsy-react';
import TextInput from 'components/shared/form-elements/input';
import MySelect from 'components/shared/form-elements/select';
import Browserfields from 'components/shared/form-elements/browser-fields';

export default class Configurator extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		onSend: React.PropTypes.func,
		agents: React.PropTypes.object
	}
	constructor(props) {
		super(props);
		this.state = {
			canSubmit: false,
			fields: []
		};
	}
	addField() {
		let fieldData = {};
		fieldData.id = Date.now();
		this.setState({ fields: this.state.fields.concat(fieldData) });
	}
	removeField(pos) {
		const fields = this.state.fields;
		this.setState({ fields: fields.slice(0, pos).concat(fields.slice(pos+1)) })
	}
	enableButton() {
		this.setState({ canSubmit: true });
	}
	disableButton() {
		this.setState({ canSubmit: false });
	}
	submit(model) {
		console.log(model);
	}
	send() {
		this.refs.configForm.submit();
	}
	render() {
		const { fields, canSubmit } = this.state;
		return (
			<div>
				<Form 
					ref="configForm" 
					onSubmit={this.submit.bind(this)} 
					onValid={this.enableButton.bind(this)} 
					onInvalid={this.disableButton.bind(this)} 
					className="configurator">
					<Browserfields
						agents={this.props.agents}
						data={fields} 
						onRemove={this.removeField.bind(this)} />
					<button onClick={this.addField.bind(this)}>Add browser</button>
					<button 
						disabled={!this.state.canSubmit} 
						className="button button--full button--yellow" 
						onClick={this.send.bind(this)}>
						Save settings
					</button>
				</Form>
			</div>
		);
	}
}