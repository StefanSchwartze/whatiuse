'use strict';

import fs from 'fs';
import path from 'path';
import debug from 'debug';

import { Router, createMemoryHistory, match, RouterContext } from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom/server';

// Paths are relative to `app` directory
//import routes from 'routes';

import Iso from 'iso';
import alt from 'utils/alt';

import createFlux from 'flux/createFlux';
import AltContainer from 'alt-container'


const runRouter = (location, routes) =>
  new Promise((resolve) =>
    match({ routes, location }, (...args) => resolve(args)))



export default function *() {
  const isCashed = this.cashed ? yield *this.cashed() : false;
  if (!isCashed) {
    const routes = require('routes')(flux)
    const flux = createFlux()

    // We seed our stores with data
    //alt.bootstrap(JSON.stringify({}));
    var iso = new Iso();

    //const history = createMemoryHistory(this.request.url);

    const [ error, redirect, renderProps ] = yield runRouter(this.request.url, routes);


    const element = (
      <AltContainer flux={ flux }>
        <RouterContext { ...renderProps } />
      </AltContainer>);


    let app
    let fluxSnapshot
    try {
      // Collect promises with a first render
      debug('dev')('first server render')
//console.log(flux);
      ReactDOM.renderToString(element);
      //console.log(flux.resolver.pendingActions)
      // Resolve them
      yield flux.resolver.dispatchPendingActions()
      fluxSnapshot = flux.takeSnapshot();

      debug('dev')('second server render')

      //fluxSnapshot = flux.takeSnapshot()
      app = ReactDOM.renderToString(element)
    } catch (renderErr) {
      // Catch rendering error, render a 500 page
      debug('koa')('rendering error')
      debug('koa')(renderErr)

      //fluxSnapshot = flux.takeSnapshot()
      //app = renderToString(<ErrorPage />)
    }


console.log('Final store:');
console.log(fluxSnapshot);

    // We use react-router to run the URL that is provided in routes.jsx
    //const node = ReactDOM.renderToString(<Router history={history}>{routes}</Router>);

    iso.add(app, fluxSnapshot);
    var content = iso.render();
    let assets;
    if (process.env.NODE_ENV === 'development') {
      assets = fs.readFileSync(path.resolve(__dirname, './webpack-stats.json'));
      assets = JSON.parse(assets);
    }
    else {
      assets = require('./webpack-stats.json');
    }

    debug('dev')('return html content');
    yield this.render('main', {content, assets});
  }
}
