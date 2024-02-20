const envs = import.meta.env;

const ugixServer = envs.VITE_UGIX_SERVER;
const ugixAuthServer = envs.VITE_UGIX_AUTH_SERVER;
const ugixOgcServer = envs.VITE_UGIX_OGC_SERVER;
const ugixCatalogue = envs.VITE_UGIX_CATALOGUE;
const authReduirectUrl = envs.VITE_AUTH_REDIRECT_URI;
const authCookie = envs.VITE_AUTH_COOKIE;
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
  ugixServer,
  ugixAuthServer,
  ugixOgcServer,
  ugixCatalogue,
  authReduirectUrl,
  authCookie,
};

export default envurls;
