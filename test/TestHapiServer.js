import HapiAuthToken from '../lib';

export default class TestHapiServer {
  constructor(server) {
    this._server = server;
  }

  async configure() {
    await this._configureAuth();
    this._configureTestRoutes();
  }

  async _registerHapiTokenAuthenticationScheme() {
    await this._server.register({
      plugin: HapiAuthToken,
      options: {
        cookie: {
          name: '__AUTH',
          isSecure: false,
        },
        async validateToken(sessionToken) {
          return !!sessionToken;
        },
        async authCredentials(sessionToken) {
          return { id: sessionToken };
        },
      },
    });
  }

  async _configureAuth() {
    await this._registerHapiTokenAuthenticationScheme();
    this._server.auth.strategy('token-auth-test', 'token-auth');
    this._server.auth.default('token-auth-test');
  }

  _configureTestRoutes() {
    this._server.route({
      method: 'GET',
      path: '/unprotected',
      config: {
        auth: false,
      },
      handler: (_request, _h) => 'Unprotected',
    });
    this._server.route({
      method: 'GET',
      path: '/protected',
      handler: (_request, _h) => 'Protected',
    });
  }
}
