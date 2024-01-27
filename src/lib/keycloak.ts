import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'https://keycloak-update.iudx.io/auth/',
  realm: 'demo',
  clientId: 'angular-iudx-client',
});
// const keycloak = new Keycloak({
//   url: 'http://localhost:8080',
//   realm: 'MultiAuth',
//   clientId: 'auth_app_one',
// });

export default keycloak;
