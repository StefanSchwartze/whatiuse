import React from 'react';
import {Link} from 'react-router';
import ProjectForm from './project-form';
import ProjectsActions from 'actions/projects-actions';

export default class Project extends React.PureComponent {
	static propTypes = {
		project: React.PropTypes.object.isRequired
	}
	constructor(props) {
		super(props);
	}
	render() {
		const project = this.props.project;
		return (
			<div className="projects-list-item">
				<Link to={'/projects/' + project._id + '/global/pages'} className="link">
					<div className="project">
						<h2 className="">{project.title}</h2>
						<p className="">{project.url}</p>
					</div>
				</Link>
				<button onClick={() => ProjectsActions.delete(project._id)} className="icon-close button button--close"></button>
				<Link to={'/projects/' + project._id + '/global/pages'} className="icon-long-arrow-right button button--icon"/>
			</div>
		);
	}
}