import React from 'react';
import ReactDOM from 'react-dom';
import {Decorator as FormsyElement} from 'formsy-react';
import classNames from 'classnames';

@FormsyElement()
export default class TextInput extends React.Component {
	static propTypes = {
		value: React.PropTypes.string,
		name: React.PropTypes.string.isRequired,
		title: React.PropTypes.string,
		type: React.PropTypes.string.isRequired,
		classes: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		autofocus: React.PropTypes.bool
	}
	componentDidMount(){
		if(this.props.autofocus) {
			ReactDOM.findDOMNode(this.refs[this.props.name]).focus(); 
		}
		if(this.props.value) {
			this.props.setValue(this.props.value);
		}
	}
	render() {
		// Set a specific className based on the validation
		// state of this component. showRequired() is true
		// when the value is empty and the required prop is
		// passed to the input. showError() is true when the
		// value typed is invalid
		var className = this.props.showRequired() ? 'required' : (!this.props.isPristine() && this.props.showError()) ? 'error' : '';

		// An error message is returned ONLY if the component is invalid
		// or the server has returned an error message
		var errorMessage = this.props.getErrorMessage();

		const label = this.props.title ? <label htmlFor={this.props.name}>{this.props.title}</label> : '';
		return (
			<div className={classNames(this.props.classes, className, 'form-group')}>
				{label}
				<input className="input"
					ref={this.props.name}
					placeholder={this.props.placeholder}
					type={this.props.type}
					onChange={(e) => this.props.setValue(e.target.value)} 
					value={this.props.getValue()}/>
				<span className='validation-error'>{errorMessage}</span>
			</div>
		);
	}
}