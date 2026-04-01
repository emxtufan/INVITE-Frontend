import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function getApiOrigin(rawApiUrl?: string): string {
  const fallback = 'http://localhost:3005';
  if (!rawApiUrl) return fallback;
  try {
    return new URL(rawApiUrl).origin;
  } catch {
    return fallback;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = getApiOrigin(env.VITE_API_URL);

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0', // Permite accesul din retea
      allowedHosts: [
        'handmade-suggest-troops-handmade.trycloudflare.com'
      ],
      proxy: {
        '/uploads': {
          target: apiOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    build: {
      outDir: 'dist',
    },
  };
});
