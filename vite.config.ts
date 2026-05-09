import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '^/api/(auth|app|apis|dashboard|logs|authorization)(/|$)': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      '^/api/smartdoc(/|$)': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
});
