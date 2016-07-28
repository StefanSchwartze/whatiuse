'use strict';

import React from 'react';
import {Route, IndexRoute, NotFoundRoute} from 'react-router';

import App from './components/app';
import Login from './components/login/index';
import Dashboard from './components/dashboard';
import Projects from './components/projects';
import Browsers from './components/browsers';

function requireAuth(nextState, replace) {
	if (process.env.BROWSER) {
		if (!localStorage.appUser) {
			replace(
				{ 
					pathname: '/login',
					state: { 
						nextPathname: nextState.location.pathname 
					}
				}
			)
		}
	}
}

export default (
	<Route path='/' component={App}>
		<Route
			path='login'
			component={Login} />
		<IndexRoute
			component={Projects}
			onEnter={requireAuth} />
		<Route
			path='projects/:id/pages'
			component={Dashboard}
			onEnter={requireAuth} >
			<Route
				path=':pageid'
				component={Dashboard} />
		</Route>
		<Route
			path='projects/:id/browsers'
			component={Browsers}
			onEnter={requireAuth} />
		<Route patch="*" component={require('./pages/not-found')} />
	</Route>
);

