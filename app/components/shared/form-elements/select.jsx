import React from 'react';
import ReactDOM from 'react-dom';
import {Decorator as FormsyElement} from 'formsy-react';
import classNames from 'classnames';

@FormsyElement()
export default class OptionSelect extends React.Component {
	static propTypes = {
		name: React.PropTypes.string.isRequired,
		title: React.PropTypes.string,
		options: React.PropTypes.array.isRequired,
		classes: React.PropTypes.string,
		autofocus: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        selected: React.PropTypes.string
	}
	componentDidMount(){
		if(this.props.selected) {
			this.props.setValue(this.props.selected);
		}
		if(this.props.autofocus) {
			ReactDOM.findDOMNode(this.refs[this.props.name]).focus(); 
		}
	}
    onChange(e) {
        this.props.setValue(e.target.value);
        if(this.props.onChange) {
            this.props.onChange(e.target.value);
        }
    }
    componentDidUpdate(prevProps, prevState) {
		//this.props.setValue(this.props.selected);
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

		const options = this.props.options.map((option, i) => (
			<option
				key={option.title+option.value} 
				value={option.value}>
				{option.title}
			</option>
		));
		const label = this.props.title ? <label htmlFor={this.props.name}>{this.props.title}</label> : '';
        return (
			<div className={classNames(this.props.classes, className, 'form-group select')}>
				{label}
				<select 
					className="select"
					name={this.props.name} 
					onChange={this.onChange.bind(this)}  
					value={this.props.selected || this.props.getValue()}>
					{options}
				</select>
				<span className='validation-error'>{errorMessage}</span>
			</div>
		);
	}
}