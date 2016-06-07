import React from 'react';
import OptionSelect from 'components/shared/form-elements/select';
import ShareInput from 'components/shared/form-elements/input';

export default class Browserfield extends React.Component {
	static propTypes = {
		field: React.PropTypes.object,
		onRemove: React.PropTypes.func,
		options: React.PropTypes.array,
		index: React.PropTypes.number
	}
	constructor(props) {
		super(props);
		this.state = { 
			currentBrowser: props.field.name === '' ? null : props.field.name,
			currentVersion: props.field.version === '' ? null : props.field.version 
		};
	}
	remove(i) {
		if(this.props.onRemove) {
			this.props.onRemove(i);
		}
	}
	render() {
		const field = this.props.field;
		const agents = this.props.options;
		const index = this.props.index;
		const emptyElem = {title: null, value: null};
		let versions = [];
		let currentB = this.state.currentBrowser || null;
		let currentV = this.state.currentVersion || null;
		if(currentB !== null && currentB !== '--') {
			versions = agents
						.find((agent) => { return agent.value === currentB })
						.version_list.map((version) => ({title: version.version, value: version.version}));
		} else {
			versions = [];
		}
		return (
			<div className="field">
				<OptionSelect
					selected={currentB}
					name={"browser" + index}
					ref="browser"
					title="Browser"
					required={true}
					validations="isExisty"
					options={[emptyElem].concat(agents.map((agent) => ({title: agent.title, value: agent.value})))}
					onChange={(browser) => this.setState({ currentBrowser: browser })}
				/>
				<OptionSelect
					selected={currentV}
					name={"version" + index}
					ref="version"
					title="Version"
					required={true}
					validations="isExisty"
					options={[emptyElem].concat(versions)}
					onChange={(version) => this.setState({ currentVersion: version })}
				/>
				<ShareInput
					value={field.share || null}
					name={"share" + index}
					title="Share"
					type="text"
					required={true}
					validations={"isFloat", "isExisty"}
					validationError={'Must be a valid number'} 
				/>
				<button className="remove-field" onClick={this.remove.bind(this)}>X</button>
			</div>
		);
	}
};