import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { NFTSCAN_CHAIN_IDS } from '@masknet/web3-providers'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
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
                supportedChainIds: NFTSCAN_CHAIN_IDS,
            },
        },
    },
    contribution: {
        postContent: new Set([
            /opensea.io\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/u,
            /rarible.com\/token\/(0x[\dA-Fa-f]{40}):(\d+)/u,
            /zora.co\/collections\/(0x[\dA-Fa-f]{40})\/\d+$/u,
            /opensea.io\/assets\/ethereum\/(0x[\dA-Fa-f]{40})\/(\d+)/u,
        ]),
    },
}
