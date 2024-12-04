import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const project = process.env.PROJECT;
  const envDir = path.resolve(__dirname, `env/${project}`);

  const env = loadEnv(mode, envDir);

  return {
    plugins: [react()],
    define: {
      'process.env': env,
    },
    server: {
      port: 3000,
      host: '127.0.0.1',
      proxy: {
        '/adex': {
          target: 'https://rs.adex.org.in',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/adex', ''),
        },
      },
    },
  };
});
