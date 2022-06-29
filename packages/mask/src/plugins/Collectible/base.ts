import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.Ropsten, ChainId.Rinkeby],
            },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        postContent: new Set([
            /opensea.io\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/,
            /rarible.com\/token\/(0x[\dA-Fa-f]{40}):(\d+)/,
            /zora.co\/collections\/(0x[\dA-Fa-f]{40})\/\d+$/,
            // see https://docs.solana.com/integrations/exchange#basic-verfication
            /magiceden.io\/item-details\/([1-9A-HJ-NP-Za-km-z]{32,44})/,
        ]),
    },
}
