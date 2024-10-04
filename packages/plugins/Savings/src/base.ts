import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID, DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { SAVINGS_PLUGIN_ID } from './constants.js'
import { languages } from './locale/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: SAVINGS_PLUGIN_ID,
    name: { fallback: 'Savings' },
    description: {
        fallback: 'A plugin for Savings',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
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
                    ChainId.Astar,
                    ChainId.Optimism,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    i18n: languages,
}
