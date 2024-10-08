import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, NetworkPluginID, getSiteType } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { RedPacketMetaKey, RedPacketNftMetaKey, RedPacketPluginID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: RedPacketPluginID,
    name: { fallback: 'Lucky Drop' },
    description: {
        fallback:
            'Lucky drop is a special feature in Mask Network which was launched in early 2020. Once users have installed the Chrome/Firefox plugin, they can claim and give out cryptocurrencies on Twitter.',
    },
    // Won't show publisher on Firefly
    publisher: getSiteType() === EnhanceableSite.Firefly ? undefined : DEFAULT_PLUGIN_PUBLISHER,
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
                ],
            },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        metadataKeys: new Set([RedPacketMetaKey, RedPacketNftMetaKey]),
    },
    i18n: languages,
}
