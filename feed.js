var graph = require('fbgraph');
var RSS   = require('rss');

graph.setAccessToken(process.env.ACCESS_TOKEN);

var options = {
  timeout: process.env.REQUEST_TIMEOUT || 5000,
  pool: {
    maxSockets: Infinity
  },
  headers: {
    connection: 'keep-alive'
  }
};

var fetch_graph = function(id) {
  return new Promise(function(resolve, reject) {
    graph
      .setOptions(options)
      .get(id + '/feed', function(err, res) {
        if (err) {
          reject(err);
        }
        if (typeof res.data === 'undefined' || res.data.length === 0) {
          reject('no data found');
        }
        resolve(res);
      });
  });
};

var generate_feed = function(res) {
  try {
    var data = res.data[0];
    var feedOptions = {
      title: data.to ? data.to.data[0].name : data.from.name,
      description: '',
      pubDate: data.updated_time,
      language: 'th',
      feed_url: 'http://facefeed.herokuapp.com/' + data.from.id,
      ttl: 10
    };
    var feed = new RSS(feedOptions);

    res.data.forEach(function(item) {
      body = item.message || item.story || '';
      feed.item({
        title: body.substring(0, 140),
        description: body,
        url: item.actions ? item.actions[0].link : item.link,
        guid: item.id,
      });
    });

    return feed.xml();
  }
  catch (ex) {
    return 'problem generating feed ' + ex;
  }
};

var get_feed_by_id = function(request, reply) {
  if (parseInt(request.params.id)) {
    fetch_graph(request.params.id)
      .then(generate_feed)
      .then(reply)
      .catch(reply);
  } else {
    reply(
      request.params.id + ' is not a valid page/group id. ' +
      'find one at <a href="http://lookup-id.com/">lookup-id.com</a>'
    );
  }
};

module.exports = {
  get_feed_by_id: get_feed_by_id
};
