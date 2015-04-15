var lab    = exports.lab = require('lab').script();
var chai   = require('chai');
var server = require('../server');

var describe = lab.describe;
var it       = lab.it;

chai.should();

describe('Facebook graph fetching', function() {

  it('returns error message if id is not a number', function(done) {
    var options = {method: 'GET', url: '/abc'};
    server.inject(options, function(res) {
      res.statusCode.should.be.equal(400);
      res.result.message.should.be.equal('child "id" fails because ["id" must be a number]');
      done();
    });
  });

  it('returns error message if id is not an integer', function(done) {
    var options = {method: 'GET', url: '/123.21'};
    server.inject(options, function(res) {
      res.statusCode.should.be.equal(400);
      res.result.message.should.be.equal('child "id" fails because ["id" must be an integer]');
      done();
    });
  });

  it('returns 200 status code', function(done) {
    var options = {method: 'GET', url: '/29347023874234'};
    server.inject(options, function(res) {
      res.statusCode.should.be.equal(200);
      done();
    });
  });
});
