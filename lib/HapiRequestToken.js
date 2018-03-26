export default class HapiRequestToken {
  constructor(hapiRequest, tokenOptions) {
    HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER = 'token';
    HapiRequestToken.DEFAULT_OPTIONS = {
      header: true,
      query: { name: HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER },
    };
    this._hapiRequest = hapiRequest;
    this._tokenOptions = { ...HapiRequestToken.DEFAULT_OPTIONS, ...tokenOptions };
  }

  get value() {
    return this._extractToken();
  }

  _extractToken() {
    return this._extractTokenFromHeader() || this._extractTokenFromQuery();
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
    const queryParameterName = this._tokenOptions.query.name ||
      HapiRequestToken.DEFAULT_TOKEN_QUERY_PARAMETER;
    return this._hapiRequest.query[queryParameterName] || null;
  }
}
