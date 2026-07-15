import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

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
            },
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Polygon,
                    ChainId.Arbitrum,
                    ChainId.Base,
                    ChainId.xDai,
                    ChainId.Fantom,
                    ChainId.Optimism,
                    ChainId.Avalanche,
                    ChainId.Aurora,
                    ChainId.Conflux,
                    ChainId.Astar,
                    ChainId.Scroll,
                    ChainId.Metis,
                    ChainId.XLayer,
                    ChainId.Sei,
                    ChainId.Robinhood,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
}
