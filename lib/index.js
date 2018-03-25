import TokenAuthenticationScheme from './TokenAuthenticationScheme';

export default {
  // eslint-disable-next-line global-require
  pkg: require('../package.json'),
  register: async (server, options) => new TokenAuthenticationScheme(server, options).register(),
};
