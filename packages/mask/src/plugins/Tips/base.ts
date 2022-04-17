import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { TipsEnterancePluginId } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: TipsEnterancePluginId,
    name: { fallback: 'Tips' },
    description: {
        fallback: 'Tips Enterance',
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
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Matic,
                    ChainId.Arbitrum,
                    ChainId.xDai,
                    ChainId.Aurora,
                    ChainId.Avalanche,
                    ChainId.Fantom,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
}
