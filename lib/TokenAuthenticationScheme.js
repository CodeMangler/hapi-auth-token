import Boom from '@hapi/boom';
import Hoek from '@hapi/hoek';
import Joi from 'joi';
import { PLUGIN_OPTIONS_SCHEMA } from './Constants';
import HapiAuthCookie from './HapiAuthCookie';
import HapiRequestToken from './HapiRequestToken';

export default class TokenAuthenticationScheme {
  constructor(schemeOptions) {
    const DEFAULT_OPTIONS = {
      validateToken: () => true,
      buildAuthCredentials: () => ({ id: null }),
    };
    this._options = { ...DEFAULT_OPTIONS, ...schemeOptions };
    this.register = this.register.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  register(server, strategyOptions) {
    this._options = { ...this._options, ...strategyOptions };
    const validationResults = PLUGIN_OPTIONS_SCHEMA.validate(this._options);
    Hoek.assert(!validationResults.error, validationResults.error);

    new HapiAuthCookie(server, this._options.cookie || {}).initialize();
    return this;
  }

  async authenticate(request, h) {
    const { validateToken, buildAuthCredentials } = this._options;
    const authToken = new HapiRequestToken(request, this._options).value;

    const isTokenValid = await validateToken(authToken);
    if (isTokenValid) {
      const credentials = await buildAuthCredentials(authToken);
      return h.authenticated({ credentials });
    }
    return Boom.unauthorized('Invalid credentials');
  }
}
