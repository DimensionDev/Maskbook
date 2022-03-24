import { Plugin, NetworkPluginID } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { SAVINGS_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: SAVINGS_PLUGIN_ID,
    icon: '\u{1F4B0}',
    name: { fallback: 'Savings' },
    description: {
        fallback: 'A plugin for Savings',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
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
        },
    },
}
