import { expect } from 'chai';
import HapiRequestToken from '../lib/HapiRequestToken';

describe('HapiRequestToken', () => {
  describe('#value', () => {
    describe('from header', () => {
      it('returns token value from the authorization header if present', () => {
        const requestStub = { headers: { authorization: 'Token foo-bar' } };
        const token = new HapiRequestToken(requestStub);
        expect(token.value).to.eq('foo-bar');
      });

      it('returns null when an authorization header is not present', () => {
        const requestStub = { headers: {} };
        const token = new HapiRequestToken(requestStub);
        expect(token.value).to.be.null;
      });

      it('returns null when authorization header does not have a token', () => {
        const requestStub = { headers: { authorization: 'Basic foo-bar' } };
        const token = new HapiRequestToken(requestStub);
        expect(token.value).to.be.null;
      });

      it('returns null when authorization header does not match the expected format', () => {
        const requestStub = { headers: { authorization: 'foo-bar' } };
        const token = new HapiRequestToken(requestStub);
        expect(token.value).to.be.null;
      });

      it('returns null when token parsing from header has not been configured', () => {
        const requestStub = { headers: { authorization: 'Token foo-bar' } };
        const token = new HapiRequestToken(requestStub, { header: false });
        expect(token.value).to.be.null;
      });
    });
  });
});
