var Q       = require('q');
var request = require('request');
var RSS     = require('rss');

function Feed() {
  this.token = process.env.ACCESS_TOKEN;
}

Feed.prototype.fetchGraph = function(id) {
  var deferred = Q.defer();
  var options  = {
    url: 'https://graph.facebook.com/v2.3/' + id + '/feed',
    timeout: process.env.NODE_ENV === 'test' ? 200 : 5000,
    qs: {
      access_token: this.token
    }
  };

  request(options, function(err, res, body) {
    if (err) {
      deferred.reject(err.code);
    } else if (res.statusCode !== 200) {
      deferred.reject(JSON.parse(body));
    } else {
      deferred.resolve(JSON.parse(body));
    }
  });

  return deferred.promise;
};

Feed.prototype.generateFeed = function(res) {
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

module.exports = Feed;
