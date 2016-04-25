'use strict';

import React from 'react';
import {Route, DefaultRoute, NotFoundRoute} from 'react-router';

import App from './components/app';
import Login from './components/login/index';
import Examples from './components/examples';


export default (
  <Route name='app' path='/' handler={App}>
    <DefaultRoute
      name='examples'
      handler={Examples} />
    <Route
      name='login'
      handler={Login} />
    <NotFoundRoute handler={require('./pages/not-found')} />
  </Route>
);

