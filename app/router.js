import React from 'react';
import { Router, browserHistory, createMemoryHistory } from 'react-router'
import routes from 'routes';

let history;

if (process.env.BROWSER) {
	history = browserHistory;
} else {
	history = createMemoryHistory();
}

export default (<Router history={history}>{routes}</Router>);