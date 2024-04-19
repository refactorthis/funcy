import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'json-summary'],
      include: ['package/src/**/*.ts'],
    },
  },
})
