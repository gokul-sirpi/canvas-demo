import axios from 'axios';
import keycloak from './keycloak';
import envurls from '../utils/config';

export const axiosAuthClient = axios.create({
  baseURL: envurls.gsixAuthServer,
});

axiosAuthClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
