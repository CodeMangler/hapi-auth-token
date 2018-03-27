/* eslint-disable class-methods-use-this */

import TokenAuthenticationScheme from './TokenAuthenticationScheme';

export default class TokenAuthenticationSchemePlugin {
  constructor(server, schemeOptions) {
    this._server = server;
    this._options = schemeOptions;
  }

  async register() {
    return this._registerAuthenticationScheme();
  }

  async _registerAuthenticationScheme() {
    const scheme = new TokenAuthenticationScheme(this._options);
    this._server.auth.scheme('token-auth', scheme.register);
  }
}
