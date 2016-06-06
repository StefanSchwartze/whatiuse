import React from 'react';
import OptionSelect from 'components/shared/form-elements/select';

export default class Browserfields extends React.Component {
	static propTypes = {
		data: React.PropTypes.array,
		onRemove: React.PropTypes.func,
		agents: React.PropTypes.object
	}
	constructor(props) {
		super(props);
	}
	remove(i) {
		if(this.props.onRemove) {
			this.props.onRemove(i);
		}
	}
	toggleVersion(e) {
		console.log(e);
	}
	render() {
		let agentArray = [];
		let agents = this.props.agents;
		Object.keys(agents).map((agentKey) => {
			let agent = agents[agentKey];
			agent.title = agent.browser;
			agent.value = agentKey;
			agentArray.push(agent);
		});

		return (
			<div className="fields">
				{this.props.data.map((field, i) => {
					let showVersion = false;
					return (

						<div className="field" key={field.id}>
							<OptionSelect
								name={`fields[${i}]`}
								title={'Browser'}
								required={field.required}
								validations={field.validations}
								options={agentArray.map((agent) => ({ title: agent.title, value: agent.value }))}
								onChange={this.toggleVersion.bind(this)}
							/>
							<OptionSelect
								name={`fields[${i+1}]`}
								title={'Version'}
								required={field.required}
								validations={field.validations}
								options={[
									{title: '45', value: '45'},
									{title: '46', value: '46'}
								]}
							/>
							<button className="remove-field" onClick={this.remove.bind(this, i)}>X</button>
						</div>
					)
				})}
			</div>
		);
	}
};