import React from 'react';
import AltContainer from 'alt-container';

import ProjectForm from 'components/shared/forms/project-form';
import {Link} from 'react-router';

import ProjectsStore from 'stores/projects-store';
import ProjectsActions from 'actions/projects-actions';

import {findItemById} from 'utils/store-utils';
import {sortBy, orderBy, flatten, reduce, forEach, floor, map, values, head} from 'lodash';

import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

@authDecorator
@connectToStores
export default class Projects extends React.Component {
	static propTypes = {
		projects: React.PropTypes.array,
		currentPageId: React.PropTypes.string
	}
	static getStores(props) {
		return [ProjectsStore];
	}
	static getPropsFromStores(props) {
		return ProjectsStore.getState();
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		return ProjectsActions.fetch();
	}
	render() {
		return (
			<AltContainer
				stores={{
					ProjectsStore: ProjectsStore
				}}>
				<div className="content-container content">
					<div className="projects-list">
						{this.props.projects && this.props.projects.map((item, index) =>
							<Link to='dashboard' className="link">
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
				</div>
			</AltContainer>
		);
	}
}