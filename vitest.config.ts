import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'json-summary'],
      include: ['packages/**/*.ts'],
    },
  },
})
