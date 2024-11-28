import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

const resolve = (spec: string) => fileURLToPath(new URL(import.meta.resolve(spec)))
export default defineConfig({
    test: {
        include: ['./packages/**/tests/**/*.ts'],
        alias: {
            '@masknet/sdk': resolve('./packages/mask-sdk/server/index.ts'),
            '@masknet/base': resolve('./packages/base/src/index.ts'),
            '@masknet/flags': resolve('./packages/flags/src/index.ts'),
            '@masknet/shared-base': resolve('./packages/shared-base/src/index.ts'),
            '@masknet/shared-base-ui': resolve('./packages/shared-base-ui/src/index.ts'),
            '@masknet/web3-helpers': resolve('./packages/web3-helpers/src/index.ts'),
            '@masknet/web3-providers/helpers': resolve('./packages/web3-providers/src/entry-helpers.ts'),
            '@masknet/web3-providers': resolve('./packages/web3-providers/src/entry.ts'),
            '@masknet/web3-telemetry/types': resolve('./packages/web3-telemetry/src/entry-types.ts'),
            '@masknet/web3-telemetry/helpers': resolve('./packages/web3-telemetry/src/entry-helpers.ts'),
            '@masknet/web3-telemetry': resolve('./packages/web3-telemetry/src/entry.ts'),
            '@masknet/web3-shared-base': resolve('./packages/web3-shared/base/src/index.ts'),
            '@masknet/web3-shared-evm': resolve('./packages/web3-shared/evm/src/index.ts'),
            '@masknet/web3-shared-solana': resolve('./packages/web3-shared/solana/src/index.ts'),
            '@masknet/web3-shared-flow': resolve('./packages/web3-shared/flow/src/index.ts'),
            '@masknet/public-api': resolve('./packages/public-api/src/index.ts'),
            '@masknet/typed-message': resolve('./packages/typed-message/base/src/index.ts'),
            '@masknet/encryption': resolve('./packages/encryption/src/index.ts'),
            '@masknet/injected-script': resolve('./packages/injected-script/sdk/index.ts'),
            '@masknet/plugin-infra/dom': resolve('./packages/plugin-infra/src/dom/index.ts'),
            '@masknet/plugin-infra': resolve('./packages/plugin-infra/src/entry.ts'),
            '@masknet/theme': resolve('./packages/theme/src/index.ts'),
        },
        setupFiles: ['./packages/vitest-setup/index.ts', './packages/encryption/test-setup.js'],
    },
})
