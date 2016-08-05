import React from 'react';
import AltContainer from 'alt-container';
import {authDecorator} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';
import ProjectForm from './project-form';
import ProjectsList from './projects-list';
import ProjectsStore from 'stores/projects-store';
import ProjectsActions from 'actions/projects-actions';
import connect from 'connect-alt';

//@authDecorator
@connect('projects')
export default class Projects extends React.Component {
	static contextTypes = {
		flux: React.PropTypes.object.isRequired
	}
	static propTypes = {
		projectsStore: React.PropTypes.object.isRequired,
		projectsHash: React.PropTypes.object,
		currentPageId: React.PropTypes.string
	}
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		const { flux } = this.context;
		flux.getActions('projects').fetch();
	}
	render() {
		return (
			<ProjectsList />
		);
	}
}