import { SiteAdaptor, type Plugin } from '@masknet/plugin-infra'
import { PluginID, NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.Tips,
    name: { fallback: 'Tips' },
    description: {
        fallback: 'Tips Entrance',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [SiteAdaptor.Facebook]: false,
                [SiteAdaptor.Minds]: false,
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
                    ChainId.Conflux,
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
