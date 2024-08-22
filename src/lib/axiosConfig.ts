import axios from 'axios';
import keycloak from './keycloak';
import envurls from '../utils/config';

export const axiosAuthClient = axios.create({
  baseURL: envurls.ugixAuthServer + 'auth/',
});

axiosAuthClient.interceptors.request.use((config) => {
  // const token =
  // config.headers.Authorization = token;
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
