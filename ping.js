var http = require('http');

var options = {
  host: 'facefeed.herokuapp.com',
  port: 80,
};

var req = http.request(options, function(res) {
  console.log('facefeed status: ' + res.statusCode);
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.end();
