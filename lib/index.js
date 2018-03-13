'use strict';

var TokenAuthenticationScheme = require('./TokenAuthenticationScheme');

module.exports = {
  pkg: require('../package.json'),
  register: async (server, options) => {
    return new TokenAuthenticationScheme(server).register();
  },
};
