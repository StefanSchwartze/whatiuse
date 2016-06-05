import React from 'react';
import { Form } from 'formsy-react';
import TextInput from 'components/shared/form-elements/input';

import MySelect from 'components/shared/form-elements/select';

const Fields = props => {
	function onRemove(pos) {
		return event => {
			event.preventDefault();
			props.onRemove(pos);
		};
	}
	return (
		<div className="fields">
			{props.data.map((field, i) => (
				<div className="field" key={field.id}>
					{
						<MySelect
							name={`fields[${i}]`}
							title={field.validations ? JSON.stringify(field.validations) : 'No validations'}
							required={field.required}
							validations={field.validations}
							options={[
								{title: '123', value: '123'},
								{title: 'some long text', value: 'some long text'},
								{title: '`empty string`', value: ''},
								{title: 'alpha42', value: 'alpha42'},
								{title: 'test@mail.com', value: 'test@mail.com'}
							]}
						/>
					}
					<a href="#" className="remove-field" onClick={onRemove(i)}>X</a>
				</div>
				))
			}
		</div>
	);
};

export default class Configurator extends React.Component {
	static propTypes = {
		pages: React.PropTypes.array,
		onSend: React.PropTypes.func
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
					<Fields 
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