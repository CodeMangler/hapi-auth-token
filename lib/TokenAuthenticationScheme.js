/* eslint-disable class-methods-use-this */

import Boom from 'boom';

export default class TokenAuthenticationScheme {
  constructor(server, options) {
    TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME = '__TOKEN_AUTH';
    this._server = server;
    this._options = options;
  }

  async register() {
    this._initializeCookie();
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

    const cookieOptions = {
      ...cookieDefaults,
      ...this._options.cookie,
    };

    const cookieName = this._options.cookie.name ||
      TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME;
    this._server.state(cookieName, cookieOptions);
  }

  async _registerAuthenticationScheme() {
    this._server.auth.scheme(
      'token-auth',
      (_server, _options) => ({ authenticate: this._authenticate.bind(this) }),
    );
  }

  async _authenticate(request, h) {
    const validateToken = this._options.validateToken || (() => true);
    const authCredentials = this._options.authCredentials || (() => ({ id: null }));

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
    const cookieName = this._options.cookie.name ||
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
