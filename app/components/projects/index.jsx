import React from 'react';
import AltContainer from 'alt-container';
import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';
import ProjectForm from './project-form';
import ProjectsList from './projects-list';
import ProjectsStore from 'stores/projects-store';
import ProjectsActions from 'actions/projects-actions';

@authDecorator
@connectToStores
export default class Projects extends React.Component {
	static contextTypes: {
		location: React.PropTypes.object
	}
	static propTypes = {
		projects: React.PropTypes.array,
		projectsHash: React.PropTypes.object,
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
			<AltContainer store={ProjectsStore}>
				<ProjectsList />
			</AltContainer>
		);
	}
}