var lab   = exports.lab = require('lab').script();
var chai  = require('chai');
var Feed  = require('../feed');
var nock  = require('nock');

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
});
