import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import HapiAuthCookie from '../lib/HapiAuthCookie';

chai.use(sinonChai);

describe('HapiAuthCookie', () => {
  describe('#initialize', () => {
    it('configures cookie on the server with the specified options', () => {
      const mockServer = { state: sinon.spy() };
      const hapiAuthCookie = new HapiAuthCookie(mockServer, { name: '__AUTH' });
      hapiAuthCookie.initialize();
      expect(mockServer.state).to.have.been.calledWith('__AUTH', {
        ttl: 1000 * 60 * 60 * 24,
        encoding: 'base64json',
        isSecure: true,
        isHttpOnly: true,
        path: '/',
      });
    });
  });
});
