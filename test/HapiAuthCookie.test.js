import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import HapiAuthCookie from '../lib/HapiAuthCookie';

chai.use(sinonChai);

describe('HapiAuthCookie', () => {
  describe('#initialize', () => {
    const cookieOptions = {
      ttl: 1000 * 60 * 60 * 24,
      encoding: 'base64json',
      isSecure: false,
      isHttpOnly: false,
      path: '/',
    };

    it('configures cookie on the server with the specified options', () => {
      const mockServer = { state: sinon.spy() };
      const hapiAuthCookie = new HapiAuthCookie(mockServer, { name: '__AUTH', ...cookieOptions });
      hapiAuthCookie.initialize();
      expect(mockServer.state).to.have.been.calledWith('__AUTH', cookieOptions);
    });

    it('defaults to "__TOKEN_AUTH" for cookie name if an explicit name is not provided', () => {
      const mockServer = { state: sinon.spy() };
      const hapiAuthCookie = new HapiAuthCookie(mockServer, cookieOptions);
      hapiAuthCookie.initialize();
      expect(mockServer.state).to.have.been.calledWith('__TOKEN_AUTH', cookieOptions);
    });
  });
});
