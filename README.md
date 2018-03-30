# hapi-auth-token

[![Build Status](https://travis-ci.org/CodeMangler/hapi-auth-token.svg?branch=master)](https://travis-ci.org/CodeMangler/hapi-auth-token)
[![Coverage Status](https://coveralls.io/repos/github/CodeMangler/hapi-auth-token/badge.svg)](https://coveralls.io/github/CodeMangler/hapi-auth-token)

This [Hapi](https://github.com/hapijs/hapi) plugin provides a token based authentication scheme.

The authentication scheme secures endpoints with token authentication, and exposes hooks to validate
the received tokens & set custom credentials object onto authenticated Hapi requests (which will be
accessible as `request.auth.credentials` in the route handlers post-authentication).
User authentication and token generation should be handled by the application.
The scheme will automatically extract auth token from Cookie, Header or Query parameter,
making it convenient to use any of those modes for token authentication.

## Installation

`npm install --save hapi-auth-token`

OR

`yarn add hapi-auth-token`

## Usage
Follow these steps to use this plugin in your Hapi application.

1. Register the plugin
  ```javascript
  import HapiAuthToken from 'hapi-auth-token';

  await server.register(HapiAuthToken)
  ```

2. Configure an auth strategy from the `token-auth` scheme
  ```javascript
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

  this._server.auth.strategy('token-auth-strategy', 'token-auth', strategyOptions);
  ```

The key parameters in configuration of the strategy are the `validateToken` and `buildAuthCredentials` functions.
- `validateToken` will be called with the extracted authentication token, and is expected to respond back with a boolean indicating whether the token is valid.
- `buildAuthCredentials` will be called if `validateToken` returns true, and is expected to return a JSON object, which will be set as the auth credentials for the current request.
The object returned by this function will be accessible as `request.auth.credentials` in the authenticated route handlers.

Here's a more elaborate snippet:

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

See [hapi-auth-token-db-example](https://github.com/CodeMangler/hapi-auth-token-db-example) for an example of how the plugin can be used for DB user authentication.

## API
The plugin can be configured during plugin registration, and/or during auth strategy registration.
Options can be passed during plugin registration like this:
  ```javascript
  await server.register({plugin: HapiAuthToken, options: {<hapi-auth-token-options>}});
  ```
Or during strategy registration like this:
  ```javascript
  server.auth.strategy('<strategy-name>', 'token-auth', {<hapi-auth-token-options>});
  ```
Note that the final set of options would be a combination of these two option sets, and the options provided to the strategy will override plugin level options when there's a conflict.

### Plugin/Strategy Options
- `cookie`
  - `false` or an `object`
    - `false` will disable reading auth tokens from cookies
    - Hapi cookie options object (https://github.com/hapijs/hapi/blob/master/API.md#-serverstatename-options) to configure the auth cookie.
  - `name` is the name of the auth cookie. Defaults to `__TOKEN_AUTH`
- `header`
  - Boolean indicating whether token authentication via the `Authorization` header should be enabled
    - If `true`, the plugin will read auth-token from the `Authorization: Token <auth-token>` header
    - If `false`, `Authorization` headers are ignored by the plugin
    - Defaults to `true`
- `query`
  - `false` or an `object`
    - `false` will disable reading auth tokens from query parameters
    - An options object with the following attributes can be provided to enable reading auth tokens from query parameters
      - `name` is the name of the query parameter to read the auth token from. Defaults to the `token` parameter.
  - Defaults to: `{name: 'token'}`
- `validateToken`
  - A function that accepts an auth token (string) and returns a boolean indicating whether the supplied token is valid.
  - This is where you can customize the token validation logic, and this is a required parameter.
- `buildAuthCredentials`
  - A function that accepts an auth token (string) and returns a JSON object that would be set as the credentials object on authenticated requests.
  - This will be invoked only if `validateToken` returns true.
  - The object returned by this function will be accessible as `request.auth.credentials` in authenticated route handlers.
