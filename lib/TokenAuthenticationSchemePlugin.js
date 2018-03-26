/* eslint-disable class-methods-use-this */

import Boom from 'boom';
import { DEFAULT_AUTH_COOKIE_NAME } from './Constants';
import HapiRequestToken from './HapiRequestToken';

export default class TokenAuthenticationSchemePlugin {
  constructor(server, schemeOptions) {
    this._server = server;
    this._options = schemeOptions;
  }

  async register() {
    return this._registerAuthenticationScheme();
  }

  _initializeCookie() {
    const cookieDefaults = {
      ttl: 1000 * 60 * 60 * 24,
      encoding: 'base64json',
      isSecure: true,
      isHttpOnly: true,
      path: '/',
    };

    const cookieName = this._options.cookie.name || DEFAULT_AUTH_COOKIE_NAME;

    const cookieOptionsClone = { ...this._options.cookie };
    delete cookieOptionsClone.name;

    const cookieOptions = {
      ...cookieDefaults,
      ...cookieOptionsClone,
    };

    this._server.state(cookieName, cookieOptions);
  }

  _tokenAuthenticationScheme(_server, strategyOptions) {
    this._options = { ...this._options, ...strategyOptions };
    this._initializeCookie();
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
