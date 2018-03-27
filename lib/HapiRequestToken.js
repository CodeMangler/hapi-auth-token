import { DEFAULT_AUTH_COOKIE_NAME, DEFAULT_TOKEN_PARAMETER } from './Constants';

export default class HapiRequestToken {
  constructor(hapiRequest, tokenOptions) {
    HapiRequestToken.DEFAULT_OPTIONS = {
      cookie: { name: DEFAULT_AUTH_COOKIE_NAME },
      header: true,
      query: { name: DEFAULT_TOKEN_PARAMETER },
      payload: { name: DEFAULT_TOKEN_PARAMETER },
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
      || this._extractTokenFromQuery()
      || this._extractTokenFromPayload();
  }

  _extractTokenFromCookie() {
    if (!this._tokenOptions.cookie) {
      return null;
    }

    const cookieName = this._tokenOptions.cookie.name || DEFAULT_AUTH_COOKIE_NAME;
    const authCookie = this._hapiRequest.state[cookieName];
    if (!authCookie) {
      return null;
    }
    return authCookie.authToken;
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
    const tokenParameterName = this._tokenOptions.query.name || DEFAULT_TOKEN_PARAMETER;
    return (this._hapiRequest.query && this._hapiRequest.query[tokenParameterName]) || null;
  }

  _extractTokenFromPayload() {
    if (!this._tokenOptions.payload) {
      return null;
    }
    const tokenParameterName = this._tokenOptions.payload.name || DEFAULT_TOKEN_PARAMETER;
    return (this._hapiRequest.payload && this._hapiRequest.payload[tokenParameterName]) || null;
  }
}
