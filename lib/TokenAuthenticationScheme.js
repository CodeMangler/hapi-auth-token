import HapiAuthCookie from './HapiAuthCookie';
import HapiRequestToken from './HapiRequestToken';

export default class TokenAuthenticationScheme {
  constructor(schemeOptions) {
    const DEFAULT_OPTIONS = {
      validateToken: () => true,
      authCredentials: () => ({ id: null }),
    };
    this._options = { ...DEFAULT_OPTIONS, ...schemeOptions };
  }

  register(server, strategyOptions) {
    this._options = { ...this._options, ...strategyOptions };
    new HapiAuthCookie(server, this._options.cookie || {}).initialize();
    return this;
  }

  async authenticate(request, h) {
    const { validateToken, authCredentials } = this._options;
    const sessionToken = new HapiRequestToken(request, this._options).value;

    const isTokenValid = await validateToken(sessionToken);
    if (isTokenValid) {
      const credentials = await authCredentials(sessionToken);
      return h.authenticated({ credentials });
    }
    return null;
  }
}
