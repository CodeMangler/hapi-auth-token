import { expect } from 'chai';
import HapiRequestToken from '../lib/HapiRequestToken';

describe('HapiRequestToken', () => {
  describe('#value', () => {
    describe('from header', () => {
      it('is token value from the authorization header if present', () => {
        const requestStub = { headers: { authorization: 'Token a-token' } };
        const token = new HapiRequestToken(requestStub);
        expect(token.value).to.eq('a-token');
      });

      it('is null when an authorization header is not present', () => {
        const requestStub = { headers: {} };
        const token = new HapiRequestToken(requestStub, { query: false });
        expect(token.value).to.be.null;
      });

      it('is null when authorization header does not have a token', () => {
        const requestStub = { headers: { authorization: 'Basic a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false });
        expect(token.value).to.be.null;
      });

      it('is null when authorization header does not match the expected format', () => {
        const requestStub = { headers: { authorization: 'a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false });
        expect(token.value).to.be.null;
      });

      it('is null when token parsing from header has not been enabled', () => {
        const requestStub = { headers: { authorization: 'Token a-token' } };
        const token = new HapiRequestToken(requestStub, { header: false, query: false });
        expect(token.value).to.be.null;
      });
    });

    describe('from query parameter', () => {
      it('is value of the specified query parameter', () => {
        const requestStub = { query: { tokenParameter: 'a-token' } };
        const token = new HapiRequestToken(requestStub, {
          query: { name: 'tokenParameter' },
          header: false,
        });
        expect(token.value).to.eq('a-token');
      });

      it('defaults to value of the token query parameter', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, { header: false });
        expect(token.value).to.eq('a-token');
      });

      it('is null when the specified query parameter is not present', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, {
          query: { name: 'tokenParameter' },
          header: false,
        });
        expect(token.value).to.be.null;
      });

      it('is null when query parameter tokens are not enabled', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false, header: false });
        expect(token.value).to.be.null;
      });
    });
  });
});
