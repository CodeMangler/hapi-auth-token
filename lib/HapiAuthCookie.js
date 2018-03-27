import { DEFAULT_AUTH_COOKIE_NAME } from './Constants';

export default class HapiAuthCookie {
  constructor(server, cookieOptions = {}) {
    this._server = server;
    this._options = cookieOptions;
  }

  initialize() {
    const DEFAULT_COOKIE_OPTIONS = {
      ttl: 1000 * 60 * 60 * 24,
      encoding: 'base64json',
      isSecure: true,
      isHttpOnly: true,
      path: '/',
    };

    const cookieName = this._options.name || DEFAULT_AUTH_COOKIE_NAME;

    const cookieOptionsClone = { ...this._options };
    delete cookieOptionsClone.name;

    const cookieOptions = {
      ...DEFAULT_COOKIE_OPTIONS,
      ...cookieOptionsClone,
    };

    this._server.state(cookieName, cookieOptions);
  }
}
