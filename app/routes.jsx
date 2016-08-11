'use strict';

import React from 'react';
import {Route, IndexRedirect, NotFoundRoute} from 'react-router';

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
		<IndexRedirect to="/projects" />
		<Route
			path='projects'
			component={Projects}
			onEnter={requireAuth} />
		<Route
			path='projects/:projectid'
			onEnter={requireAuth} >
			<IndexRedirect to="global" />
			<Route
				path=':scope' >
				<IndexRedirect to="pages" />
				<Route
					path='pages'
					component={Dashboard} >
					<Route
						path=':pageid'
						component={Dashboard} >
						<Route
							path=':elementid'
							component={Dashboard} />
					</Route>
				</Route>
				<Route
					path='browsers'
					component={Browsers} >
					<Route
						path=':browserid'
						component={Browsers} />
				</Route>

			</Route>

		</Route>
		<Route patch="*" component={require('./pages/not-found')} />
	</Route>
);

