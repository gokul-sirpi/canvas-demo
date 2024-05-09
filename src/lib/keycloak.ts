import Keycloak from 'keycloak-js';
import { keycloakEnv } from '../utils/config';

const keycloak: Keycloak = new Keycloak({
  url: keycloakEnv.keycloakUrl,
  realm: keycloakEnv.realm,
  clientId: keycloakEnv.clientId,
});

keycloak.onTokenExpired = () => {
  if (keycloak.authenticated) {
    keycloak.updateToken().catch((err) => {
      console.log(err);
    });
  }
};

export default keycloak;
