import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PLULISHER, NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ITO_MetaKey_1, ITO_MetaKey_2, ITO_PluginID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: ITO_PluginID,
    name: { fallback: 'ITO' },
    description: {
        fallback: 'Participate in Public Offering on Twitter.',
    },
    publisher: DEFAULT_PLUGIN_PLULISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {},
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
    contribution: { metadataKeys: new Set([ITO_MetaKey_1, ITO_MetaKey_2]) },
    i18n: languages,
}
