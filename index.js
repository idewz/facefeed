var graph = require('fbgraph')
var RSS   = require('rss')
var Hapi  = require('hapi')

var server = new Hapi.Server()
server.connection({ 
    host: 'localhost', 
    port: process.env.PORT || 8000
})

graph.setAccessToken(process.env['ACCESS_TOKEN'])

var options = {
    timeout:  3000
  , pool:     { maxSockets: Infinity }
  , headers:  { connection: "keep-alive" }
}

server.route({
    method: 'GET',
    path:'/{id}', 
    handler: function (request, reply) {
        var id = parseInt(request.params.id)
        if (id) {
            graph
                .setOptions(options)
                .get(id + "/feed", function(err, res) {
                    // reply(res.data);
                    var feedOptions = {
                        title: res.data[0].to.data[0].name,
                        description: '',
                        pubDate: res.data[0].updated_time,
                        language: 'th',
                        feed_url: 'http://facefeed.herokuapp.com/' + id,
                        ttl: 10
                    }
                    var feed = new RSS(feedOptions)
                    res.data.forEach(function(item) {
                        feed.item({
                            title: item.message.substring(0, 140),
                            description: item.message,
                            url: item.link,
                            guid: item.id,
                        });
                    });
                    reply(feed.xml());
                });
        }
        else {
            reply(request.params.id + ' is not a group id. you can find by going to <a href="http://lookup-id.com/">lookup-id.com</a>')
        }
    }
})

server.start()