'use strict';

import React from 'react';
import {Route, IndexRoute, NotFoundRoute} from 'react-router';

import App from './components/app';
import Login from './components/login/index';
import Dashboard from './components/dashboard';
import Projects from './components/projects';

export default (
	<Route path='/' component={App}>
		<Route
			path='login'
			component={Login} />
		<IndexRoute
			component={Projects} />
		<Route
			path='projects/:id'
			component={Dashboard} />
		<Route patch="*" component={require('./pages/not-found')} />
	</Route>
);

