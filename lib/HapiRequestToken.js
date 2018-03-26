export default class HapiRequestToken {
  constructor(hapiRequest, tokenOptions) {
    HapiRequestToken.DEFAULT_OPTIONS = { header: true };
    this._hapiRequest = hapiRequest;
    this._tokenOptions = { ...HapiRequestToken.DEFAULT_OPTIONS, ...tokenOptions };
  }

  get value() {
    return this._extractToken();
  }

  _extractToken() {
    return this._extractTokenFromHeader();
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
}
