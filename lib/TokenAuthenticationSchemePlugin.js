/* eslint-disable class-methods-use-this */

import Boom from 'boom';
import HapiAuthCookie from './HapiAuthCookie';
import HapiRequestToken from './HapiRequestToken';

export default class TokenAuthenticationSchemePlugin {
  constructor(server, schemeOptions) {
    this._server = server;
    this._options = schemeOptions;
  }

  async register() {
    return this._registerAuthenticationScheme();
  }

  _tokenAuthenticationScheme(_server, strategyOptions) {
    this._options = { ...this._options, ...strategyOptions };
    new HapiAuthCookie(this._server, this._options.cookie || {}).initialize();
    return ({ authenticate: this._authenticate.bind(this) });
  }

  async _registerAuthenticationScheme() {
    this._server.auth.scheme('token-auth', this._tokenAuthenticationScheme.bind(this));
  }

  async _authenticate(request, h) {
    const validateToken = this._options.validateToken || (() => true);
    const authCredentials = this._options.authCredentials || (() => ({ id: null }));

    const sessionToken = new HapiRequestToken(request, this._options).value;

    const isTokenValid = await validateToken(sessionToken);
    if (isTokenValid) {
      const credentials = await authCredentials(sessionToken);
      return h.authenticated({ credentials });
    }
    return Boom.unauthorized('Invalid credentials');
  }
}
