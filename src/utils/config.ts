const envs = process.env;

const ugixServer = envs.VITE_UGIX_SERVER;
const ugixAuthServer = envs.VITE_UGIX_AUTH_SERVER;
const ugixOgcServer = envs.VITE_UGIX_OGC_SERVER;
const ugixCatalogue = envs.VITE_UGIX_CATALOGUE;
const authReduirectUrl = envs.VITE_AUTH_REDIRECT_URI;
const authCookie = envs.VITE_AUTH_COOKIE;
const catalogueCookie = envs.VITE_CATALOGUE_COOKIE;
//keycloak
const keycloakUrl = envs.VITE_KEYCLOAK_URL;
const realm = envs.VITE_REALM;
const clientId = envs.VITE_CLIENT_ID;

export const keycloakEnv: any = {
  keycloakUrl,
  realm,
  clientId,
};

const envurls: any = {
  ugixServer,
  ugixAuthServer,
  ugixOgcServer,
  ugixCatalogue,
  authReduirectUrl,
  authCookie,
  catalogueCookie,
};

export default envurls;
