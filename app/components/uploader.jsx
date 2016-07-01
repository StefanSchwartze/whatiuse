import React from 'react';
import Dropzone from 'react-dropzone';

import ProjectActions from 'actions/projects-actions';
import BrowserActions from 'actions/browsers-actions';

export default class Uploader extends React.Component {
	static propTypes = {
		onSend: React.PropTypes.func
	}
	constructor(props) {
		super(props);
		this.state = {
			canSubmit: false,
			file: null
		};
	}
	removeFile() {
		this.setState({ file: null })
	}
	onDrop(files) {
		const file = files[0];
		this.setState({ file: file });

		let reader = new FileReader();
		let self = this;
		// Closure to capture the file information.
		reader.onload = (function(file) {
			return (e) => {
				let data = undefined;
				try {
					data = JSON.parse(reader.result);
					file.isValid = true;
				} catch(e) {
					console.log(e);
					file.isValid = false;
				}
				self.setState({ file: file, sendData: data });
			}
		})(file);

		// Read in the image file as text.
		if(file) {
			reader.readAsText(file);
		}
	}
	onOpenClick() {
		this.refs.dropzone.open();
	}
	uploadFile() {
		if(this.state.sendData !== undefined) {
			BrowserActions.validateBrowserset(this.state.sendData);
		}
		if(this.props.onSend) {
			//this.props.onSend();
		}
	}
	render() {
		let content;
		let button;
		const formattedfileSize = function(size) {
			let val;
			if(size >= 1000000) {
				return (size / 1000000).toFixed(1) + 'MB';
			} else if(size >= 1000) {
				return (size / 1000).toFixed(0) + 'KB';
			} else {
				return size + 'B';
			}
		}
		if(this.state.file !== null) {
			const file = this.state.file;
			content =	<div className="file-tile">
							<span className="icon-file"></span>
							<div className="desc">
								<span>{file.name}</span>
								<span>{formattedfileSize(file.size)}</span>
								<strong 
									className="strong" 
									onClick={this.removeFile.bind(this)}>
									Remove
								</strong>
							</div>
						</div>
			if(file.isValid) {
				button = <button 
							disabled={!file.isValid} 
							className="button button--full button--accent"
							onClick={this.uploadFile.bind(this)}>
							Upload
						</button>
			} else {
				button = <button 
							className="button button--full button--accent"
							onClick={this.removeFile.bind(this)}>
							File is not valid JSON. Remove.
						</button>
			}
		} else {
			content = <div className="dropzone-content">
						<p>Drop a file or <strong className="strong" onClick={this.onOpenClick.bind(this)}>click</strong> to select one to upload.</p>
						<span className="icon-cloud-upload"></span>
					</div>
			button = <button
						className="button button--full button--accent"
						onClick={this.onOpenClick.bind(this)}>
						Select file
					</button>
		}
		return (
			<div>
				<Dropzone 
					ref="dropzone"
					className="dropzone-container" 
					onDrop={this.onDrop.bind(this)}
					disableClick={true}
					multiple={false}
				>
					{content}
				</Dropzone>
				{button}
			</div>
		);
	}
}