import React from 'react';
import {Link} from 'react-router';
import ProjectForm from './project-form';
import Project from './project';

export default class ProjectsList extends React.PureComponent {
	static propTypes = {
		projects: React.PropTypes.array
	}
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="projects-list">
				{this.props.projects && this.props.projects.map(item =>
					<Project key={item._id} project={item} />)
				}
				<div className="project">
					<ProjectForm />
				</div>
			</div>
		);
	}
}