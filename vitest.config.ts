import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        passWithNoTests: true,
        clearMocks: true,
        include: ['**/*.spec.ts'],
        reporters: ['default'],
        coverage: {
            provider: 'istanbul',
            enabled: true,
            all: false,
            include: ['src/**/*.ts'],
            reporter: ['html', 'json-summary']
        }
    }
})