'use strict';

import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import App from './components/app';
import Login from './components/login/index';
import Dashboard from './components/dashboard';
import Projects from './components/projects';

export default (
	<Route name='app' path='/' handler={App}>
		<Route
			name='login'
			handler={Login} />
		<DefaultRoute
			name='projects'
			handler={Projects} />
		<Route
			name='dashboard'
			path='projects/:id'
			handler={Dashboard} />
		<NotFoundRoute handler={require('./pages/not-found')} />
	</Route>
);

