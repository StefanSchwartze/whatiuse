import React from 'react';
import ReactDOM from 'react-dom';

export default class Progressbar extends React.PureComponent {
	static propTypes = {
		progress: React.PropTypes.number.isRequired
	}
	constructor(props) {
		super(props);
	}
	render() {
		const progress = this.props.progress || 0;
		return (
			<div className="progress-container">
				<span 
					className="progress"
					style={{width: progress * 100 + '%'}}>
				</span>
			</div>
		);
	}
}

