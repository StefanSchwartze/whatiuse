import React from 'react';
import { Form } from 'formsy-react';
import Browserfields from 'components/shared/form-elements/browser-fields';
import ProjectActions from 'actions/projects-actions';
import BrowserActions from 'actions/browsers-actions';

export default class Configurator extends React.Component {
	static propTypes = {
		onSend: React.PropTypes.func,
		agents: React.PropTypes.object.isRequired,
		browsers: React.PropTypes.array.isRequired,
		currentProject: React.PropTypes.object.isRequired
	}
	constructor(props) {
		super(props);
		this.state = {
			canSubmit: false,
			fields: props.browsers || []
		};
	}
	addField(e) {
		e.preventDefault();
		let field = {
            share: 0,
            title: "",
            version: '',
            id: Date.now()
        };
		this.setState({ fields: this.state.fields.concat(field) });
	}
	removeField(pos) {
		const fields = this.state.fields;
		this.setState({ fields: fields.slice(0, pos).concat(fields.slice(pos+1)) })
	}
	submit(data) {
		
		let project = this.props.currentProject;
		let fieldCount = Object.keys(data).length / 3;
		let models = [];

		for (var i = 0; i < fieldCount; i++) {
			let name = data['browser' + i];
			let version = data['version' + i];
			let share = data['share' + i];
			let model = {
				name: name,
				version: version,
				share: share
			}
			models.push(model);
		}
		
		project.settings.browsers = models;
		ProjectActions.update(project._id, project);
		BrowserActions.update('custom', models);
		if(this.props.onSend) {
			this.props.onSend();
		}
	}
	send(e) {
		e.preventDefault();
		this.refs.configForm.submit();
	}
	render() {
		const { fields, canSubmit } = this.state;
		return (
			<div>
				<Form 
					ref="configForm" 
					onSubmit={this.submit.bind(this)} 
					onValid={() => this.setState({ canSubmit: true })} 
					onInvalid={() => this.setState({ canSubmit: false })} 
					className="configurator">
					<Browserfields
						agents={this.props.agents}
						data={fields} 
						onRemove={this.removeField.bind(this)} />
					<button 
						className="button button--wide button--yellow button--add" 
						onClick={this.addField.bind(this)}>+ Add browser</button>
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