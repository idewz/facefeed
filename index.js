var graph = require('fbgraph')
var RSS   = require('rss')
var Hapi  = require('hapi')

var server = new Hapi.Server()
server.connection({  
    port: process.env.PORT || 8000
})

graph.setAccessToken(process.env['ACCESS_TOKEN'])

var options = {
    timeout:  5000
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
                    if (err) {
                        reply(err)
                        return
                    }
                    if (res.data.length === 0) {
                        reply("no data")
                        return
                    }
                    try {
                        var data = res.data[0];
                        var feedOptions = {
                            title: data.to ? data.to.data[0].name : data.from.name,
                            description: '',
                            pubDate: data.updated_time,
                            language: 'th',
                            feed_url: 'http://facefeed.herokuapp.com/' + id,
                            ttl: 10
                        }
                        var feed = new RSS(feedOptions)
                        res.data.forEach(function(item) {
                            body = item.message || item.story || ''
                            feed.item({
                                title: body.substring(0, 140),
                                description: body,
                                url: item.actions ? item.actions[0].link : item.link,
                                guid: item.id,
                            });
                        });
                        reply(feed.xml());
                    }
                    catch(ex) {
                        reply("problem generating feed: " + ex)
                    }
                })
        }
        else {
            reply(request.params.id + ' is not a group id. you can find by going to <a href="http://lookup-id.com/">lookup-id.com</a>')
        }
    }
})

server.start(function () {
    console.log('Server running at:', server.info.uri);
})