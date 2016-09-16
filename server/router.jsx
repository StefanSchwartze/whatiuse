'use strict';

import fs from 'fs';
import path from 'path';
import debug from 'debug';

import { Router, createMemoryHistory, match, RouterContext } from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom/server';

// Paths are relative to `app` directory
import routes from 'routes';

import Iso from 'iso';
import alt from 'utils/alt';

const runRouter = (location, routes) =>
  new Promise((resolve) =>
    match({ routes, location }, (...args) => resolve(args)));

export default function *(next) {
  const isCashed = this.cashed ? yield *this.cashed() : false;
  if (!isCashed) {

    // We seed our stores with data
    alt.bootstrap(JSON.stringify({}));
    var iso = new Iso();

    const [ error, redirect, renderProps ] = yield runRouter(this.request.url, routes);

    if (!renderProps) {
        return next;
    }
console.log(renderProps);
    // We use react-router to run the URL that is provided in routes.jsx
    const node = ReactDOM.renderToString(<RouterContext { ...renderProps } />);

    iso.add(node, alt.flush());
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
