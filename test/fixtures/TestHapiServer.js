import HapiAuthToken from '../../lib/index';

export default class TestHapiServer {
  constructor(server) {
    this._server = server;
  }

  async configure() {
    await this._configureAuth();
    this._configureTestRoutes();
  }

  async _registerHapiTokenAuthenticationScheme() {
    await this._server.register(HapiAuthToken);
  }

  async _configureAuth() {
    await this._registerHapiTokenAuthenticationScheme();
    this._server.auth.strategy('token-auth-test', 'token-auth', {
      cookie: {
        name: '__AUTH',
        isSecure: false,
      },
      async validateToken(authToken) {
        return !!authToken;
      },
      async buildAuthCredentials(authToken) {
        return { id: authToken };
      },
    });
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
