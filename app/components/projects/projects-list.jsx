import React from 'react';
import {Link} from 'react-router';
import ProjectForm from './project-form';

export default class ProjectsList extends React.Component {
	static propTypes = {
		projects: React.PropTypes.array
	}
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="projects-list">
				{this.props.projects && this.props.projects.map((item, index) =>
					<Link key={item._id} to={'/projects/' + item._id + ''} className="link">
						<div className="project" key={index} >
							<h2 className="">{item.title}</h2>
							<p className="">{item.url}</p>
						</div>
					</Link>)
				}
				<div className="project">
					<ProjectForm />
				</div>
			</div>
		);
	}
}