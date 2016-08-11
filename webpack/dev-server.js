// forked from @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/webpack/dev-server.js
'use strict';

require('babel-core/register');
require('babel-polyfill');

var debug = require('debug')('dev');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('./dev.config');

var compiler = webpack(config.webpack);
var devServer = new WebpackDevServer(compiler, config.server.options);

devServer.listen(config.server.port, 'localhost', function () {
  debug('webpack-dev-server listen on port %s', config.server.port);
});
