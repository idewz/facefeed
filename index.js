var Feed = require('./feed');
var Hapi = require('hapi');
var Joi  = require('joi');

var feed   = new Feed();
var server = new Hapi.Server();

server.connection({
  port: process.env.PORT || 8000
});

server.route({
  method: 'GET',
  path: '/{id}',
  handler: function(request, reply) {
    feed.fetch_graph(request.params.id)
      .then(feed.generate_feed)
      .then(reply)
      .catch(reply);
  },
  config: {
    validate: {
      params: {
        id: Joi.number().integer()
      }
    }
  }
});

server.start(function() {
  console.log('Server running at:', server.info.uri);
});
