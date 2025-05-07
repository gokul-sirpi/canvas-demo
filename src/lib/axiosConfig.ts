import axios from 'axios';
import keycloak from './keycloak';
import envurls from '../utils/config';

export const axiosAuthClient = axios.create({
  baseURL: envurls.ugixAuthServer + 'auth/',
});

axiosAuthClient.interceptors.request.use((config) => {
  // const token =
  //   'Bearer eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhMmE3MjczNi0yY2E2LTQ4NTgtODBiMi1hMWU5NDljNmZiMjAifQ.eyJleHAiOjE3NDY1NjM3NDgsImlhdCI6MTc0NjUyNzc0OCwianRpIjoiZTE1NjMzMDItZjBmMy00OWZlLTgyY2ItMTc3NGVmMmNhZDRhIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5hZGV4Lm9yZy5pbi9hdXRoL3JlYWxtcy9hZGV4Iiwic3ViIjoiZDAzOTM5ZWMtYmExMy00ZDRiLThjY2QtN2RiMjdhNGQwNzFmIiwidHlwIjoiU2VyaWFsaXplZC1JRCIsInNlc3Npb25fc3RhdGUiOiI5NDE0YzcwMS04ZjUyLTQ2OTctODdhMi1lNDZjMWNjNWY3MDQiLCJzaWQiOiI5NDE0YzcwMS04ZjUyLTQ2OTctODdhMi1lNDZjMWNjNWY3MDQiLCJzdGF0ZV9jaGVja2VyIjoiUkRKUDdNdmw0MldUQlRJV3FPSHhFcEowUGVBRzZCWFFMOWxoWFU2UTRYcyJ9.xL6rZ1DRwhbx6N4JFKPE7aj1tRSTmYNVYljH-QgQCL4'
  // config.headers.Authorization = token;
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});
