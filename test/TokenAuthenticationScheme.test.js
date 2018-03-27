/* eslint-disable no-unused-expressions */

import Boom from 'boom';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import TokenAuthenticationScheme from '../lib/TokenAuthenticationScheme';

chai.use(sinonChai);

describe('TokenAuthenticationScheme', () => {
  let mockServer = null;
  let responseToolkit = null;
  const authentiationModeOptions = {
    cookie: false,
    header: false,
    query: false,
    payload: false,
  };

  beforeEach(() => {
    mockServer = { state: () => {} };
    responseToolkit = { authenticated: sinon.spy() };
  });

  describe('#register', () => {
    it('strategy options override scheme options when present', async () => {
      const schemeOptions = {
        ...authentiationModeOptions,
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
          ...authentiationModeOptions,
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

    it(
      'default options are used when explicit scheme or strategy options are not provided',
      async () => {
        const schemeOptions = { cookie: false, header: false };
        const strategyOptions = {};
        const scheme = new TokenAuthenticationScheme(schemeOptions);
        scheme.register(mockServer, strategyOptions);
        await scheme.authenticate({}, responseToolkit);
        expect(responseToolkit.authenticated).to.have.been
          .calledWith({ credentials: { id: null } });
      },
    );

    it('throws exception when invalid options do not match the expected schema', async () => {
      const strategyOptions = {
        invalidOption: 'foo',
      };
      const scheme = new TokenAuthenticationScheme(authentiationModeOptions);
      expect(() => {
        scheme.register(mockServer, strategyOptions);
      }).to.throw('"invalidOption" is not allowed');
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
        const scheme = new TokenAuthenticationScheme(authentiationModeOptions);
        scheme.register(mockServer, strategyOptions);
        await scheme.authenticate({}, responseToolkit);
        expect(responseToolkit.authenticated).to.have.been
          .calledWith({ credentials: { foo: 'bar' } });
      },
    );

    it('does not mark the request authenticated when validateToken returns false', async () => {
      const strategyOptions = {
        validateToken: () => false,
      };
      const scheme = new TokenAuthenticationScheme(authentiationModeOptions);
      scheme.register(mockServer, strategyOptions);
      await scheme.authenticate({}, responseToolkit);
      expect(responseToolkit.authenticated).not.to.have.been.called;
    });

    it('returns unauthorized when validateToken returns false', async () => {
      const strategyOptions = {
        validateToken: () => false,
      };
      const scheme = new TokenAuthenticationScheme(authentiationModeOptions);
      scheme.register(mockServer, strategyOptions);
      const authenticationResult = await scheme.authenticate({}, responseToolkit);
      const expectedResult = Boom.unauthorized('Invalid credentials');
      expect(JSON.stringify(authenticationResult)).to.deep.eq(JSON.stringify(expectedResult));
    });
  });
});
