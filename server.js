var conf = require('./config');
var Feed = require('./feed');
var Hapi = require('hapi');
var Joi  = require('joi');

var feed   = new Feed();
var server = new Hapi.Server();

server.connection({
  port: conf.get('PORT')
});

server.route({
  method: 'GET',
  path: '/{id}',
  handler: function(request, reply) {
    feed.fetchGraph(request.params.id, request.query.type)
      .then(feed.generateFeed)
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

module.exports = server;
