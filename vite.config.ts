import { defineConfig } from 'vitest/config'

function createURL(pathToFile: string) {
    return new URL(pathToFile, import.meta.url).toString()
}

export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.ts'],
        alias: {
            '@masknet/shared-base': createURL('./packages/shared-base/src/index.ts'),
            '@masknet/web3-helpers': createURL('./packages/web3-helpers/src/index.ts'),
            '@masknet/web3-providers': createURL('./packages/web3-providers/src/index.ts'),
            '@masknet/web3-shared-base': createURL('./packages/web3-shared/base/src/index.ts'),
            '@masknet/web3-shared-evm': createURL('./packages/web3-shared/evm/src/index.ts'),
            '@masknet/web3-shared-solana': createURL('./packages/web3-shared/solana/src/index.ts'),
            '@masknet/web3-shared-flow': createURL('./packages/web3-shared/flow/src/index.ts'),
            '@masknet/public-api': createURL('./packages/public-api/src/index.ts'),
            '@masknet/typed-message': createURL('./packages/typed-message/base/index.ts'),
        },
    },
})
