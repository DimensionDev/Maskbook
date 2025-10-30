import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { NFTSCAN_CHAIN_IDS } from '@masknet/web3-providers'

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
                supportedChainIds: NFTSCAN_CHAIN_IDS,
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
}
