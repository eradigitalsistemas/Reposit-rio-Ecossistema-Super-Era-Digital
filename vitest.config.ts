import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['supabase/functions/**/*.ts'],
      exclude: ['supabase/functions/**/index.ts', 'supabase/functions/tests/**/*.ts'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    testTimeout: 5000,
  },
})
