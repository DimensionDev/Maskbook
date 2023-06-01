import { defineConfig } from 'vitest/config'

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).toString()
}

export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.ts'],
        alias: {
            '@masknet/base': createURL('./packages/base/src/index.ts'),
            '@masknet/flags': createURL('./packages/flags/src/index.ts'),
            '@masknet/shared-base': createURL('./packages/shared-base/src/index.ts'),
            '@masknet/web3-modals': createURL('./packages/web3-modals/src/index.ts'),
            '@masknet/web3-helpers': createURL('./packages/web3-helpers/src/index.ts'),
            '@masknet/web3-providers/helpers': createURL('./packages/web3-providers/src/entry-helpers.ts'),
            '@masknet/web3-providers': createURL('./packages/web3-providers/src/entry.ts'),
            '@masknet/web3-telemetry/types': createURL('./packages/web3-telemetry/src/entry-types.ts'),
            '@masknet/web3-telemetry/helpers': createURL('./packages/web3-telemetry/src/entry-helpers.ts'),
            '@masknet/web3-telemetry': createURL('./packages/web3-telemetry/src/entry.ts'),
            '@masknet/web3-shared-base': createURL('./packages/web3-shared/base/src/index.ts'),
            '@masknet/web3-shared-evm': createURL('./packages/web3-shared/evm/src/index.ts'),
            '@masknet/web3-shared-solana': createURL('./packages/web3-shared/solana/src/index.ts'),
            '@masknet/web3-shared-flow': createURL('./packages/web3-shared/flow/src/index.ts'),
            '@masknet/public-api': createURL('./packages/public-api/src/index.ts'),
            '@masknet/typed-message': createURL('./packages/typed-message/base/src/index.ts'),
            '@masknet/encryption': createURL('./packages/encryption/src/index.ts'),
            '@masknet/injected-script': createURL('./packages/injected-script/sdk/index.ts'),
        },
        setupFiles: ['./setups/index.ts', './packages/encryption/test-setup.js'],
    },
})
