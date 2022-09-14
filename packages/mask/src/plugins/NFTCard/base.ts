import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
import { ChainId as ChainIdFlow } from '@masknet/web3-shared-flow'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: {
            type: 'opt-in',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
            },
        },
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainIdEVM.Mainnet,
                    ChainIdEVM.BSC,
                    ChainIdEVM.Matic,
                    ChainIdEVM.Arbitrum,
                    ChainIdEVM.xDai,
                    ChainIdEVM.Aurora,
                    ChainIdEVM.Avalanche,
                    ChainIdEVM.Fantom,
                    ChainIdEVM.Astar,
                    ChainIdEVM.Harmony,
                    ChainIdEVM.Optimism,
                ],
            },
            [NetworkPluginID.PLUGIN_SOLANA]: {
                supportedChainIds: [ChainIdSolana.Mainnet],
            },
            [NetworkPluginID.PLUGIN_FLOW]: {
                supportedChainIds: [ChainIdFlow.Mainnet],
            },
        },
        target: 'stable',
    },
    experimentalMark: true,
}
