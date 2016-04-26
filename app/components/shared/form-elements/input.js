import React from 'react';
import {Decorator as FormsyElement} from 'formsy-react';
import classNames from 'classnames';

@FormsyElement()
export default class TextInput extends React.Component {
	static propTypes = {
		name: React.PropTypes.string.isRequired,
		title: React.PropTypes.string.isRequired,
		type: React.PropTypes.string.isRequired,
		classes: React.PropTypes.string,
		placeholder: React.PropTypes.string
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

		return (
			<div className={className + ' form-group'}>
				<label htmlFor={this.props.name}>{this.props.title}</label>
				<input className={classNames('input', this.props.classes)}
						placeholder={this.props.placeholder}
						type="text" 
						onChange={(e) => this.props.setValue(e.target.value)} 
						value={this.props.getValue()}/>
				<span className='validation-error'>{errorMessage}</span>
			</div>
		);
	}
}