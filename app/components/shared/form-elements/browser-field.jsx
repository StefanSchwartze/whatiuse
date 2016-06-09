import React from 'react';
import OptionSelect from 'components/shared/form-elements/select';
import ShareInput from 'components/shared/form-elements/input';
import classnames from 'classnames';

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
	changeBrowser(browser, clickEvent) {
		if(clickEvent) {
			clickEvent.preventDefault();
		}
		this.setState({ currentBrowser: browser });
	}
	render() {
		const field = this.props.field;
		const agents = this.props.options;
		const index = this.props.index;
		const emptyElem = {title: null, value: null};
		const popularBrowsers = ['chrome', 'firefox', 'opera', 'safari', 'ie'];
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
			<div className="browser-field">
				<div className="quick-selector">
				{popularBrowsers.map((browser, i) =>
					<button 
						key={i}
						className={
							classnames('icon-' + browser, 'button button--browser', 
										this.state.currentBrowser === browser ? 'active' : '')
						}
						onClick={this.changeBrowser.bind(this, browser)}>
					</button>
				)}
				</div>
				<OptionSelect
					classes="select--browser"
					selected={currentB}
					name={"browser" + index}
					ref="browser"
					required={true}
					validations="isExisty"
					options={[emptyElem].concat(agents.map((agent) => ({title: agent.title, value: agent.value})))}
					onChange={this.changeBrowser.bind(this)}
				/>
				<OptionSelect
					classes="select--version"
					selected={currentV}
					name={"version" + index}
					ref="version"
					required={true}
					validations="isExisty"
					options={[emptyElem].concat(versions)}
					onChange={(version) => this.setState({ currentVersion: version })}
				/>
				<ShareInput
					classes="input--share"
					value={field.share || null}
					name={"share" + index}
					type="text"
					required={true}
					validations={"isFloat", "isExisty"}
					validationError={'Must be a valid number'} 
				/>
				<button className="icon-close button button--delete" onClick={this.remove.bind(this)}></button>
			</div>
		);
	}
};