import { defineConfig } from 'vitest/config';
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
  },
  test: {
    environment: 'jsdom',
    setupFiles: 'src/test/setup.ts',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: [
        'src/api/appManage.ts',
        'src/api/authorization.ts',
        'src/api/smartdoc.ts',
        'src/utils/request.ts',
        'src/utils/storage.ts',
        'src/views/app/passwordPolicy.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/main.ts',
        'src/App.vue',
        'src/mock/**',
        'src/test/**',
        'src/**/*.test.ts',
        'src/vite-env.d.ts'
      ]
    }
  }
});
