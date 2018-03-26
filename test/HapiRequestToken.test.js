/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import HapiRequestToken from '../lib/HapiRequestToken';

describe('HapiRequestToken', () => {
  describe('#value', () => {
    describe('from cookie', () => {
      it('is sessionToken in the specified cookie when available', () => {
        const requestStub = { state: { __AUTH: { sessionToken: 'a-token' } } };
        const token = new HapiRequestToken(requestStub, {
          cookie: { name: '__AUTH' },
          header: false,
          query: false,
        });
        expect(token.value).to.eq('a-token');
      });

      it('defaults to the "__TOKEN_AUTH" cookie', () => {
        const requestStub = { state: { __TOKEN_AUTH: { sessionToken: 'a-token' } } };
        const token = new HapiRequestToken(requestStub, { header: false, query: false });
        expect(token.value).to.eq('a-token');
      });

      it('is null when the specified cookie is not available', () => {
        const requestStub = { state: {} };
        const token = new HapiRequestToken(requestStub, { header: false, query: false });
        expect(token.value).to.be.null;
      });

      it('is null when cookie tokens are not enabled', () => {
        const requestStub = { state: {} };
        const token = new HapiRequestToken(requestStub, {
          cookie: false,
          header: false,
          query: false,
        });
        expect(token.value).to.be.null;
      });
    });

    describe('from header', () => {
      it('is token value from the authorization header if present', () => {
        const requestStub = { headers: { authorization: 'Token a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false, cookie: false });
        expect(token.value).to.eq('a-token');
      });

      it('is null when an authorization header is not present', () => {
        const requestStub = { headers: {} };
        const token = new HapiRequestToken(requestStub, { query: false, cookie: false });
        expect(token.value).to.be.null;
      });

      it('is null when authorization header does not have a token', () => {
        const requestStub = { headers: { authorization: 'Basic a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false, cookie: false });
        expect(token.value).to.be.null;
      });

      it('is null when authorization header does not match the expected format', () => {
        const requestStub = { headers: { authorization: 'a-token' } };
        const token = new HapiRequestToken(requestStub, { query: false, cookie: false });
        expect(token.value).to.be.null;
      });

      it('is null when token parsing from header has not been enabled', () => {
        const requestStub = { headers: { authorization: 'Token a-token' } };
        const token = new HapiRequestToken(requestStub, {
          header: false,
          query: false,
          cookie: false,
        });
        expect(token.value).to.be.null;
      });
    });

    describe('from query parameter', () => {
      it('is value of the specified query parameter', () => {
        const requestStub = { query: { tokenParameter: 'a-token' } };
        const token = new HapiRequestToken(requestStub, {
          query: { name: 'tokenParameter' },
          header: false,
          cookie: false,
        });
        expect(token.value).to.eq('a-token');
      });

      it('defaults to value of the "token" query parameter', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, { header: false, cookie: false });
        expect(token.value).to.eq('a-token');
      });

      it('is null when the specified query parameter is not present', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, {
          query: { name: 'tokenParameter' },
          header: false,
          cookie: false,
        });
        expect(token.value).to.be.null;
      });

      it('is null when query parameter tokens are not enabled', () => {
        const requestStub = { query: { token: 'a-token' } };
        const token = new HapiRequestToken(requestStub, {
          query: false,
          header: false,
          cookie: false,
        });
        expect(token.value).to.be.null;
      });
    });
  });
});
