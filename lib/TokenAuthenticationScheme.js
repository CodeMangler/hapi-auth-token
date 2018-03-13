var Boom = require('boom');

function TokenAuthenticationScheme(server, options) {
  TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME = '__TOKEN_AUTH';

  this._server = server;

  this.register = async function() {
    this._initializeCookie();
    return this._registerAuthenticationScheme();
  };

  this._initializeCookie = function() {
    options.cookie = options.cookie || {};

    var cookieDefaults = {
      ttl: 1000 * 60 * 60 * 24,
      encoding: 'base64json',
      isSecure: true,
      isHttpOnly: true,
      path: '/',
    };

    var cookieName = options.cookie.name || TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME;
    var cookieOptions = {
      ttl: options.cookie.ttl || cookieDefaults.ttl,
      encoding: options.cookie.encoding || cookieDefaults.encoding,
      isSecure: options.cookie.isSecure || cookieDefaults.isSecure,
      isHttpOnly: options.cookie.isHttpOnly || cookieDefaults.isHttpOnly,
      path: options.cookie.path || cookieDefaults.path,
    };
    this._server.state(cookieName, cookieOptions);
  };

  this._registerAuthenticationScheme = async function() {
    this._server.auth.scheme('token-auth', (server, options) => {
      return ({ authenticate: this._authenticate.bind(this) });
    });
  };

  this._authenticate = async function(request, h) {
    var validateToken = options.validateToken || function() {
      return true;
    };
    var authCredentials = options.authCredentials || function() {
      return { id: sessionUser.userId };
    };

    var sessionToken = this._extractTokenFromCookie(request)
        || this._extractTokenFromHeader(request)
        || this._extractTokenFromQuery(request);

    let isTokenValid = await validateToken(sessionToken);
    if (isTokenValid) {
      let credentials = await authCredentials(sessionToken);
      return h.authenticated({ credentials: credentials });
    }
    return Boom.unauthorized('Invalid credentials');
  };

  this._extractTokenFromQuery = function(request) {
    return request.query.token;
  };

  this._extractTokenFromCookie = function(request) {
    var authCookie = request.state[TokenAuthenticationScheme.DEFAULT_AUTH_COOKIE_NAME];
    if (!authCookie) {
      return null;
    }
    return authCookie.sessionToken;
  };

  this._extractTokenFromHeader = function(request) {
    var authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }
    var tokenExtractor = /\w+\s*(.*)/;
    var matches = tokenExtractor.exec(authorizationHeader.toString());
    if (matches.length !== 2) {
      return null;
    }
    return matches[1];
  };
}

module.exports = TokenAuthenticationScheme;