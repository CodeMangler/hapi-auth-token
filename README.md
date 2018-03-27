# hapi-auth-token

[![Build Status](https://travis-ci.org/CodeMangler/hapi-auth-token.svg?branch=master)](https://travis-ci.org/CodeMangler/hapi-auth-token)
[![Coverage Status](https://coveralls.io/repos/github/CodeMangler/hapi-auth-token/badge.svg)](https://coveralls.io/github/CodeMangler/hapi-auth-token)

This plugin provides token based authentication session support for [Hapi](https://github.com/hapijs/hapi).

User authentication and token generation should be handled by the application.
The plugin provides an authentication scheme that takes care of securing the endpoints,
and also exposes hooks to validate the received tokens and to set a custom credentials
object onto the Hapi session (which will be accessible as `request.auth.credentials` in the
route handlers post-authentication).
The scheme will automatically extract the auth token from Cookie, Header or Query parameter, thus
making it convenient to use any of those modes for token authentication.

## Installation

`npm install --save hapi-auth-token`

OR

`yarn add hapi-auth-token`

## Usage

```javascript
import Hapi from 'hapi';
import HapiAuthToken from 'hapi-auth-token';

const server = new Hapi.Server();

async function configureAuth() {
  // Register the HapiAuthToken plugin
  await server.register(HapiAuthToken);

  // Initialize plugin/strategy options
  const strategyOptions = {
    cookie: {
      name: '__AUTH', // Auth cookie name
      isSecure: false,
    },
    header: false, // Disable extracting token from the "Authorization" header
    query: {
      name: 'authToken', // Name of the query parameter to read the auth token from
    },

    async validateToken(authToken) {
      // Verify whether the token is valid, for example, against a list of existing tokens like below
      return models.UserToken.isValid(authToken);
    },

    async buildAuthCredentials(authToken) {
      // Identify user based on the token information
      // Return a credentials object based on the identified user information
      // The object returned from this method will be accessible as `request.auth.credentials` in authenticated handlers
      const user = await models.User.byAuthToken(authToken);
      return { id: user.id, profile: user.profileId };
    },
  };

  // Register an authentication strategy based on the HapiAuthToken scheme
  this._server.auth.strategy('token-auth-strategy', 'token-auth', strategyOptions);
  this._server.auth.default('token-auth-strategy');
}

configureAuth();
```
