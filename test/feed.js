var lab   = exports.lab = require('lab').script();
var chai  = require('chai');
var Feed  = require('../feed');
var graph = require('./data/graph_ok.json');
var nock  = require('nock');
var Parser = require('feedparser');
var Readable = require('stream').Readable;

var beforeEach = lab.beforeEach;
var expect = chai.expect;
var suite  = lab.suite;
var test   = lab.test;

var feed;
var emptyResponse = {};
var errorResponse = {
  error: {
    message: '(#601) Parser error: unexpected \'LIMIT\' at position 270.',
    type: 'OAuthException',
    code: 601
  }
};
var validResponse = {
  data: [
    {
      title: 'succeed!'
    }
  ]
};

suite('Facebook graph fetching', function() {
  beforeEach(function(done) {
    feed = new Feed();
    done();
  });

  test('rejects if request error', function(done) {
    nock('https://graph.facebook.com')
      .filteringPath(function(path) { return '/whatever'; })
      .get('/whatever')
      .delayConnection(500)
      .reply(400, '');

    feed.fetchGraph(123)
      .fail(function(res) {
        expect(res).to.equal('ETIMEDOUT');
        done();
      })
      .done();
  });

  test('rejects if status is not 200', function(done) {
    nock('https://graph.facebook.com')
      .filteringPath(function(path) { return '/whatever'; })
      .get('/whatever')
      .reply(401, errorResponse);

    feed.fetchGraph(123)
      .fail(function(res) {
        expect(res.error.code).to.equal(601);
        done();
      })
      .done();
  });

  test('resolves if status is 200', function(done) {
    nock('https://graph.facebook.com')
      .filteringPath(function(path) { return '/whatever'; })
      .get('/whatever')
      .reply(200, validResponse);

    feed.fetchGraph(123)
      .then(function(res) {
        expect(res.data[0].title).to.equal('succeed!');
        done();
      })
      .done();
  });
});

suite('Feed generator', function() {
  beforeEach(function(done) {
    feed = new Feed();
    done();
  });

  test('returns error if response is empty', function(done) {
    var res = feed.generateFeed(emptyResponse);
    expect(res).to.equal('problem generating feed TypeError: ' +
      'Cannot read property \'0\' of undefined');
    done();
  });

  test('returns correct rss', function(done) {
    var stream = new Readable();
    var parser = new Parser();
    var items  = [];
    var meta;

    stream.push(feed.generateFeed(graph));
    stream.push(null);
    stream.pipe(parser);

    parser.on('meta', function(_meta) {
      meta = _meta;
    });

    parser.on('readable', function() {
      items.push(this.read());
    });

    parser.on('end', function() {
      expect(meta.title).to.equal('Vibulkij');
      expect(meta.language).to.equal('th');
      expect(meta.pubdate.toISOString()).to.equal('2015-04-14T13:12:06.000Z');
      expect(meta.link).to.equal('https://www.facebook.com/148842738476647');
      expect(meta.xmlurl).to.equal('http://facefeed.herokuapp.com/148842738476647');

      expect(items.length).to.equal(graph.data.length);

      expect(items[0].title)
        .to.equal('องครักษ์ใครขอ เล่ม 4 จะออกเมื่อไหร่ครับ ^^ รออยู่นะครับ');
      expect(items[0].description)
        .to.equal('องครักษ์ใครขอ เล่ม 4 จะออกเมื่อไหร่ครับ ^^ รออยู่นะครับ');
      expect(items[0].link)
        .to.equal('https://www.facebook.com/148842738476647_1037275886299990');
      expect(items[0].guid)
        .to.equal('148842738476647_1037275886299990');

      expect(items[4].title)
        .to.equal('Coming Sooon!! "ศึกตำนาน 7 อัศวิน" เล่ม 8 ออกวางตลาดวันพุธที่ 22 เม.ย. 2558 รอกันอีกนิดนะครับ!!');
      expect(items[4].description)
        .to.equal('Coming Sooon!! "ศึกตำนาน 7 อัศวิน" เล่ม 8 ออกวางตลาดวันพุธที่ 22 เม.ย. 2558 รอกันอีกนิดนะครับ!!');
      expect(items[4].link)
        .to.equal(
          'https://www.facebook.com/vibulkij.fanclub/' +
          'photos/a.181130078581246.48186.148842738476647/1034633136564265/?type=1'
        );
      expect(items[4].guid)
        .to.equal('148842738476647_1037020576325521');

      done();
    });
  });
});
