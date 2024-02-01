import Keycloak from 'keycloak-js';

const keycloak: Keycloak = new Keycloak({
  url: 'https://keycloak-docker.iudx.io/auth',
  realm: 'demo',
  clientId: 'angular-iudx-client',
});

keycloak.onTokenExpired = () => {
  console.log('token expired');
};
// const keycloak = new Keycloak({
//   url: 'http://localhost:8080',
//   realm: 'MultiAuth',
//   clientId: 'auth_app_one',
// });

export default keycloak;
