var conf    = require('./config');
var Q       = require('q');
var request = require('request');
var RSS     = require('rss');

function Feed() {
  this.token = conf.get('ACCESS_TOKEN');
  this.allowed_types = [
    'posts',
    'tagged',
    'promotable_posts'
  ];
}

Feed.prototype.fetchGraph = function(id, type) {
  var deferred = Q.defer();
  var edge     = this.allowed_types.indexOf(type) != -1 ? type : 'feed';
  var options  = {
    url: 'https://graph.facebook.com/v2.4/' + id + '/' + edge,
    timeout: conf.get('TIMEOUT'),
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
    var data        = res.data[0];
    var pageMeta    = data.to ? data.to.data[0] : data.from;
    var feedOptions = {
      title:    pageMeta.name,
      pubDate:  data.updated_time,
      language: 'th',
      site_url: 'https://www.facebook.com/' + pageMeta.id,
      feed_url: 'http://facefeed.herokuapp.com/' + pageMeta.id,
      ttl:      10
    };
    var feed = new RSS(feedOptions);

    res.data.forEach(function(item) {
      var body = item.message || item.story || '';
      feed.item({
        title: body.substring(0, 140),
        description: body,
        url: item.link || 'https://www.facebook.com/' + item.id,
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
