var nconf = require('nconf');
var config;

nconf.argv().env();

switch (process.env.NODE_ENV) {
  case 'test':
    config = {
      TIMEOUT: 200,
      PORT: 4385,
    };
    break;

  case 'production':
    config = {
      TIMEOUT: 3000,
    };
    break;

  default:
    config = {
      TIMEOUT: 5000,
      PORT: 8000,
    };
}

nconf.defaults(config);

module.exports = nconf;
