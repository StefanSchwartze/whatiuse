import React from 'react';
import Browserfield from 'components/shared/form-elements/browser-field';

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
				{this.props.data.map((field, i) => (
					<Browserfield 
						index={i} 
						options={agentArray} 
						key={i} 
						field={field} 
						onRemove={this.remove.bind(this, i)} 
					/>
				))}
			</div>
		);
	}
};