import React from 'react';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import { Router } from 'react-router';
import routes from 'routes';

let history;

if (process.env.BROWSER) {
	history = createBrowserHistory();
} else {
	history = createMemoryHistory();
}

export default (<Router history={history}>{routes}</Router>);