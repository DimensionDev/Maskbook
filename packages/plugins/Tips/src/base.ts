import type { Plugin } from '@masknet/plugin-infra'
import { PluginID, NetworkPluginID, DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.Tips,
    name: { fallback: 'Tips' },
    description: {
        fallback: 'Tips Entrance',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {
                [EnhanceableSite.Twitter]: true,
                [EnhanceableSite.Mirror]: true,
            },
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Base,
                    ChainId.Polygon,
                    ChainId.Arbitrum,
                    ChainId.xDai,
                    ChainId.Aurora,
                    ChainId.Avalanche,
                    ChainId.Fantom,
                    ChainId.Conflux,
                    ChainId.Astar,
                    ChainId.Scroll,
                    ChainId.Optimism,
                    ChainId.Metis,
                    ChainId.XLayer,
                    ChainId.Sei,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    i18n: languages,
}
