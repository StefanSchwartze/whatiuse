# whatiuse
This is a system that allows people to have a code insight on their website and calculate support for users.

Before running the project, a mongod instance must be started

### Run the project in development:

* `$ npm run dev`

### Run in production

Build the project first:

* `$ npm run build`

Then start the koa server:

* `$ NODE_ENV=production node --harmony server/index.js` (nodejs 4.4.2)