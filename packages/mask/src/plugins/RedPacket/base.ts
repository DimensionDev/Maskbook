import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/src/web3-types'
import { ChainId } from '@masknet/web3-shared-evm'
import { RedPacketMetaKey, RedPacketNftMetaKey, RedPacketPluginID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: RedPacketPluginID,
    name: { fallback: 'Lucky Drop' },
    description: {
        fallback:
            'Lucky drop is a special feature in Mask Network which was launched in early 2020. Once users have installed the Chrome/Firefox plugin, they can claim and give out cryptocurrencies on Twitter.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-out',
            networks: {},
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic, ChainId.Mumbai],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        metadataKeys: new Set([RedPacketMetaKey, RedPacketNftMetaKey]),
    },
}
