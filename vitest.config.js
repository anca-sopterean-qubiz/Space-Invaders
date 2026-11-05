import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    reporters: ['default', 'json'],
    outputFile: {
      json: './results.json',
    },
  },
})
