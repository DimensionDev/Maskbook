import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.ts'],
        alias: {
            '@masknet/shared-base': new URL('./packages/shared-base/src/index.ts', import.meta.url),
            '@masknet/public-api': new URL('./packages/public-api/src/index.ts', import.meta.url),
            '@masknet/typed-message': new URL('./packages/typed-message/base/index.ts', import.meta.url),
        },
    },
})
