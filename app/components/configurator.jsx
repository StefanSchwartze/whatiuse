import React from 'react';
import { Form } from 'formsy-react';
import Browserfields from 'components/shared/form-elements/browser-fields';
import ProjectActions from 'actions/projects-actions';
import BrowserActions from 'actions/browsers-actions';
import { agents } from 'utils/user-agents';
import {values} from 'lodash';

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
			fields: props.browsers || []
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

		project.browserscopes.config.browsers = values(models.reduce(function(prev, current, index, array){
		   if(!(current.name in prev.result)) {
		      prev.result[current.name] = {
		      	"alias":current.name,
				"browser":agents[current.name].browser,
				"version_usage":[
					{
						"version":current.version,
						"usage":parseFloat(current.share)
					}
				]
		      };  
		   } 
		   else {
		   		if(prev.result[current.name]) {
		       		prev.result[current.name].version_usage.push({
		       			"version":current.version,
						"usage":parseFloat(current.share)
		       		});
		   		}
		   }  

		   return prev;
		},{result: {}}).result);

		ProjectActions.update(project._id, project);
		BrowserActions.update('custom', project.browserscopes.config.browsers);
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
		const convertFields = function(fields) {
			let versions = [];
			if(fields.length > 0) {
				for (var i = 0; i < fields.length; i++) {
					var browser = fields[i];
					if(browser.id) {
						versions.push(browser);
					} else {
						for (var k = 0; k < browser.version_usage.length; k++) {
							versions.push({
								name: browser.alias,
								version: browser.version_usage[k].version,
								share: browser.version_usage[k].usage,
								id: Date.now()
							});
						}
					}
				}
			}
			return versions;
		}
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
						data={convertFields(fields)} 
						onRemove={this.removeField.bind(this)} />
					<button 
						className="button button--wide button--accent button--add" 
						onClick={this.addField.bind(this)}>+ Add browser</button>
					<button 
						disabled={!this.state.canSubmit} 
						className="button button--full button--accent" 
						onClick={this.send.bind(this)}>
						Save settings
					</button>
				</Form>
			</div>
		);
	}
}