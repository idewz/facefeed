var Hapi = require('hapi');
var feed = require('./feed');

var server = new Hapi.Server();
server.connection({
  port: process.env.PORT || 8000
});

server.route({
  method: 'GET',
  path: '/{id}',
  handler: feed.get_feed_by_id
});

server.start(function() {
  console.log('Server running at:', server.info.uri);
});
