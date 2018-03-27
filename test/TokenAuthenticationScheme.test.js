/* eslint-disable no-unused-expressions */

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import TokenAuthenticationScheme from '../lib/TokenAuthenticationScheme';

chai.use(sinonChai);

describe('TokenAuthenticationScheme', () => {
  let mockServer = null;
  let responseToolkit = null;

  beforeEach(() => {
    mockServer = { state: () => {} };
    responseToolkit = { authenticated: sinon.spy() };
  });

  describe('#register', () => {
    it('strategy options override scheme options when present', async () => {
      const schemeOptions = {
        cookie: false,
        header: false,
        validateToken: () => false,
        authCredentials: () => ({ userInfo: 'from-scheme' }),
      };
      const strategyOptions = {
        validateToken: () => true,
        authCredentials: () => ({ userInfo: 'from-strategy' }),
      };
      const scheme = new TokenAuthenticationScheme(schemeOptions);
      scheme.register(mockServer, strategyOptions);
      await scheme.authenticate({}, responseToolkit);
      expect(responseToolkit.authenticated).to.have.been
        .calledWith({ credentials: { userInfo: 'from-strategy' } });
    });

    it(
      'scheme options are used when there are no overriding options in strategy options',
      async () => {
        const schemeOptions = {
          cookie: false,
          header: false,
          validateToken: () => true,
          authCredentials: () => ({ userInfo: 'from-scheme' }),
        };
        const strategyOptions = {};
        const scheme = new TokenAuthenticationScheme(schemeOptions);
        scheme.register(mockServer, strategyOptions);
        await scheme.authenticate({}, responseToolkit);
        expect(responseToolkit.authenticated).to.have.been
          .calledWith({ credentials: { userInfo: 'from-scheme' } });
      },
    );

    it('default options are used when explicit scheme or strategy options are not provided',
      async () => {
        const schemeOptions = { cookie: false, header: false };
        const strategyOptions = {};
        const scheme = new TokenAuthenticationScheme(schemeOptions);
        scheme.register(mockServer, strategyOptions);
        await scheme.authenticate({}, responseToolkit);
        expect(responseToolkit.authenticated).to.have.been
          .calledWith({ credentials: { id: null } });
      });
  });

  describe('#authenticate', () => {
    it(
      'marks the request authenticated by setting credentials returned by authCredentials when validateToken returns true',
      async () => {
        const strategyOptions = {
          validateToken: () => true,
          authCredentials: () => ({ foo: 'bar' }),
        };
        const scheme = new TokenAuthenticationScheme({ cookie: false, header: false });
        scheme.register(mockServer, strategyOptions);
        await scheme.authenticate({}, responseToolkit);
        expect(responseToolkit.authenticated).to.have.been
          .calledWith({ credentials: { foo: 'bar' } });
      },
    );

    it('does not mark the request authenticated when validateToken returns false', async () => {
      const strategyOptions = {
        validateToken: () => false,
        authCredentials: () => null,
      };
      const scheme = new TokenAuthenticationScheme({ cookie: false, header: false });
      scheme.register(mockServer, strategyOptions);
      await scheme.authenticate({}, responseToolkit);
      expect(responseToolkit.authenticated).not.to.have.been.called;
    });
  });
});
