import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Trader' },
    description: { fallback: 'View trending of cryptocurrencies, swap ERC20 tokens in various DEX markets.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Matic,
                    ChainId.Arbitrum,
                    ChainId.xDai,
                    ChainId.Aurora,
                    ChainId.Avalanche,
                    ChainId.Fantom,
                    ChainId.Harmony,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    i18n: languages,
}
