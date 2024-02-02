const gsixServer = 'https://gsx.iudx.io/ogc/v1/collections/';
const gsixAuthServer = 'https://gsx-auth.iudx.io/auth/';
const gsixOgcServer = 'https://soi.iudx.io/ogc/v1/collections/';
const soiOgcServer = 'https://mlayer-gsx.iudx.io/';
const gsixCatalogue = 'https://catalogue.gsx.iudx.io/';
const authReduirectUrl = 'https://authsso.gsx.iudx.io/';

//keycloak
const keycloakUrl = 'https://keycloak-docker.iudx.io/auth';
const realm = 'demo';
const clientId = 'angular-iudx-client';

export const keycloakEnv = {
  keycloakUrl,
  realm,
  clientId,
};

const envurls = {
  gsixServer,
  gsixAuthServer,
  gsixOgcServer,
  soiOgcServer,
  gsixCatalogue,
  authReduirectUrl,
};

export default envurls;
