// forked from @tomaash
// initial source: https://github.com/tomaash/react-example-filmdb/blob/master/webpack/utils/clean-dist.js
'use strict';

import del from 'del';
import path from 'path';
import debug from 'debug';

export default () => {
  const DIST_PATH = path.resolve(__dirname, '../../dist/*');
  del.sync([DIST_PATH]);
  debug('dev')('cleaned `dist` directory');
};
