import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Sync .env.local from parent folder if present
  const parentEnvLocal = path.resolve(__dirname, '../.env.local');
  const projectEnvLocal = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(parentEnvLocal) && !fs.existsSync(projectEnvLocal)) {
    try {
      fs.copyFileSync(parentEnvLocal, projectEnvLocal);
    } catch {
      // ignore
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
