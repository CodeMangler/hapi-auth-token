import TokenAuthenticationSchemePlugin from './TokenAuthenticationSchemePlugin';

export default {
  // eslint-disable-next-line global-require
  pkg: require('../package.json'),
  async register(server, options) {
    return new TokenAuthenticationSchemePlugin(server, options).register();
  },
};
