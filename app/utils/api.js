import restful from 'restful.js';

const server = restful().fullUrl('/api');
const api = {};

api.server = server;
const endpoints = ['projects', 'pages', 'browsers', 'snapshots'];

endpoints.forEach((endpoint)=> {
  api[endpoint] = server.all(endpoint);
});

api.updateToken = function (token) {
  server.header('auth-token', token);
};

export default api;
