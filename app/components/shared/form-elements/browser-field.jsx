import React from 'react';
import OptionSelect from 'components/shared/form-elements/select';

export default class Browserfield extends React.Component {
	static propTypes = {
		field: React.PropTypes.object,
		onRemove: React.PropTypes.func,
		options: React.PropTypes.array
	}
	constructor(props) {
		super(props);
		this.state = { currentBrowser: '' };
	}
	remove(i) {
		if(this.props.onRemove) {
			this.props.onRemove(i);
		}
	}
	toggleVersion(browser) {
		this.setState({ currentBrowser: browser });
	}
	render() {
		const field = this.props.field;
		const agents = this.props.options;
		let versions = [];
		if(this.state.currentBrowser !== '') {
			versions = agents
						.find((agent) => { return agent.value === this.state.currentBrowser })
						.version_list.map((version) => ({title: version.version, value: version.version}));
		}
		return (
			<div className="field">
				<OptionSelect
					name={"browser" + field.id}
					ref="browser"
					title={'Browser'}
					required={field.required}
					validations={field.validations}
					options={agents.map((agent) => ({title: agent.title, value: agent.value}))}
					onChange={this.toggleVersion.bind(this)}
				/>
				<OptionSelect
					name={"version" + field.id}
					ref="version"
					title={'Version'}
					required={field.required}
					validations={field.validations}
					options={versions}
				/>
				<button className="remove-field" onClick={this.remove.bind(this)}>X</button>
			</div>
		);
	}
};