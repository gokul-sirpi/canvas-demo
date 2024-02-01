import axios from 'axios';
import keycloak from './keycloak';

export const axiosAuthClient = axios.create({
  baseURL: 'https://gsx-auth.iudx.io',
});

axiosAuthClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
