/* eslint-disable class-methods-use-this */

import Boom from 'boom';

export default class TokenAuthenticationScheme {
  constructor(server, _options) {
    TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME = '__TOKEN_AUTH';
    this._server = server;
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

    const cookieName = this._authStrategyOptions.cookie.name ||
      TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME;

    const cookieOptionsClone = { ...this._authStrategyOptions.cookie };
    delete cookieOptionsClone.name;

    const cookieOptions = {
      ...cookieDefaults,
      ...cookieOptionsClone,
    };

    this._server.state(cookieName, cookieOptions);
  }

  _tokenAuthenticationScheme(_server, options) {
    this._authStrategyOptions = options;
    this._initializeCookie();
    return ({ authenticate: this._authenticate.bind(this) });
  }

  async _registerAuthenticationScheme() {
    this._server.auth.scheme('token-auth', this._tokenAuthenticationScheme.bind(this));
  }

  async _authenticate(request, h) {
    const validateToken = this._authStrategyOptions.validateToken || (() => true);
    const authCredentials = this._authStrategyOptions.authCredentials || (() => ({ id: null }));

    const sessionToken = this._extractTokenFromCookie(request)
      || this._extractTokenFromHeader(request)
      || this._extractTokenFromQuery(request);

    const isTokenValid = await validateToken(sessionToken);
    if (isTokenValid) {
      const credentials = await authCredentials(sessionToken);
      return h.authenticated({ credentials });
    }
    return Boom.unauthorized('Invalid credentials');
  }

  _extractTokenFromQuery(request) {
    return request.query.token;
  }

  _extractTokenFromCookie(request) {
    const cookieName = this._authStrategyOptions.cookie.name ||
      TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME;
    const authCookie = request.state[cookieName];
    if (!authCookie) {
      return null;
    }
    return authCookie.sessionToken;
  }

  _extractTokenFromHeader(request) {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }
    const tokenExtractor = /\w+\s*(.*)/;
    const matches = tokenExtractor.exec(authorizationHeader.toString());
    if (matches.length !== 2) {
      return null;
    }
    return matches[1];
  }
}
