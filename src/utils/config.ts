const envs = import.meta.env;

const gsixServer = envs.VITE_GSIX_SERVER;
const gsixAuthServer = envs.VITE_GSIX_AUTH_SERVER;
const gsixOgcServer = envs.VITE_GSIX_OGC_SERVER;
const soiOgcServer = envs.VITE_SOI_OGC_SERVER;
const gsixCatalogue = envs.VITE_GSIX_CATALOGUE;
const authReduirectUrl = envs.VITE_AUTH_REDIRECT_URI;
//keycloak
const keycloakUrl = envs.VITE_KEYCLOAK_URL;
const realm = envs.VITE_REALM;
const clientId = envs.VITE_CLIENT_ID;

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
