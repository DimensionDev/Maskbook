import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.ts'],
        alias: {
            '@masknet/sdk': import.meta.resolve('./packages/mask-sdk/server/index.ts'),
            '@masknet/base': import.meta.resolve('./packages/base/src/index.ts'),
            '@masknet/flags': import.meta.resolve('./packages/flags/src/index.ts'),
            '@masknet/shared-base': import.meta.resolve('./packages/shared-base/src/index.ts'),
            '@masknet/shared-base-ui': import.meta.resolve('./packages/shared-base-ui/src/index.ts'),
            '@masknet/web3-helpers': import.meta.resolve('./packages/web3-helpers/src/index.ts'),
            '@masknet/web3-providers/helpers': import.meta.resolve('./packages/web3-providers/src/entry-helpers.ts'),
            '@masknet/web3-providers': import.meta.resolve('./packages/web3-providers/src/entry.ts'),
            '@masknet/web3-shared-base': import.meta.resolve('./packages/web3-shared/base/src/index.ts'),
            '@masknet/web3-shared-evm': import.meta.resolve('./packages/web3-shared/evm/src/index.ts'),
            '@masknet/web3-shared-solana': import.meta.resolve('./packages/web3-shared/solana/src/index.ts'),
            '@masknet/public-api': import.meta.resolve('./packages/public-api/src/index.ts'),
            '@masknet/typed-message': import.meta.resolve('./packages/typed-message/base/src/index.ts'),
            '@masknet/encryption': import.meta.resolve('./packages/encryption/src/index.ts'),
            '@masknet/injected-script': import.meta.resolve('./packages/injected-script/sdk/index.ts'),
            '@masknet/plugin-infra/dom': import.meta.resolve('./packages/plugin-infra/src/dom/index.ts'),
            '@masknet/plugin-infra': import.meta.resolve('./packages/plugin-infra/src/entry.ts'),
            '@masknet/theme': import.meta.resolve('./packages/theme/src/index.ts'),
        },
        setupFiles: ['./setups/index.ts', './packages/encryption/test-setup.js'],
    },
})
