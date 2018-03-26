export default class HapiRequestToken {
  constructor(hapiRequest, tokenOptions) {
    HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER = 'token';
    HapiRequestToken.DEFAULT_AUTH_COOKIE_NAME = '__TOKEN_AUTH';
    HapiRequestToken.DEFAULT_OPTIONS = {
      header: true,
      query: { name: HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER },
      cookie: { name: HapiRequestToken.DEFAULT_AUTH_COOKIE_NAME },
    };
    this._hapiRequest = hapiRequest;
    this._tokenOptions = { ...HapiRequestToken.DEFAULT_OPTIONS, ...tokenOptions };
  }

  get value() {
    return this._extractToken();
  }

  _extractToken() {
    return this._extractTokenFromCookie()
      || this._extractTokenFromHeader()
      || this._extractTokenFromQuery();
  }

  _extractTokenFromCookie() {
    if (!this._tokenOptions.cookie) {
      return null;
    }

    const cookieName = this._tokenOptions.cookie.name || HapiRequestToken.DEFAULT_AUTH_COOKIE_NAME;
    const authCookie = this._hapiRequest.state[cookieName];
    if (!authCookie) {
      return null;
    }
    return authCookie.sessionToken;
  }

  _extractTokenFromHeader() {
    if (!this._tokenOptions.header) {
      return null;
    }
    const authorizationHeader = this._hapiRequest.headers.authorization;
    if (!authorizationHeader) {
      return null;
    }
    const tokenExtractor = /\s*Token\s*(.*)/;
    const matches = tokenExtractor.exec(authorizationHeader.toString());
    if (!matches || matches.length !== 2) {
      return null;
    }
    return matches[1];
  }

  _extractTokenFromQuery() {
    if (!this._tokenOptions.query) {
      return null;
    }
    const queryParameterName = this._tokenOptions.query.name
      || HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER;
    return this._hapiRequest.query[queryParameterName] || null;
  }
}