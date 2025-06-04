import Joi from 'joi';

export const DEFAULT_TOKEN_PARAMETER = 'token';
export const DEFAULT_AUTH_COOKIE_NAME = '__TOKEN_AUTH';

export const PLUGIN_OPTIONS_SCHEMA = Joi.object({
  cookie: Joi.alternatives().try(Joi.boolean(), Joi.object({
    name: Joi.string().required(),
    ttl: Joi.number().integer().min(0).allow(null),
    isSecure: Joi.boolean().default(true),
    isHttpOnly: Joi.boolean().default(true),
    isSameSite: Joi.valid('Strict', 'Lax').allow(false).default('Strict'),
    path: Joi.string().default('/'),
    domain: Joi.string().allow(null),
    autoValue: Joi.alternatives().try(Joi.string(), Joi.func()).allow(null),
    encoding: Joi.string().default('base64json'),
    sign: Joi.object(),
    password: Joi.alternatives(Joi.string(), Joi.object().instance(Buffer)),
    iron: Joi.object(),
    ignoreErrors: Joi.boolean().default(true),
    clearInvalid: Joi.boolean().default(false),
    strictHeader: Joi.boolean().default(true),
    passThrough: Joi.alternatives().try(Joi.boolean(), Joi.object()),
  })).required(),
  header: Joi.boolean().default(true),
  query: Joi.alternatives().try(Joi.boolean(), Joi.object({
    name: Joi.string().required(),
  })).default(true),
  payload: Joi.alternatives().try(Joi.boolean(), Joi.object({
    name: Joi.string().required(),
  })).default(true),
  validateToken: Joi.func().required(),
  buildAuthCredentials: Joi.func().required(),
});
