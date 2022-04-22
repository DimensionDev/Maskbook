import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { CYBERCONNECT_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: { name: { fallback: 'CyberConnect' }, link: 'https://github.com/cyberconnecthq' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai],
            },
            [NetworkPluginID.PLUGIN_SOLANA]: {
                supportedChainIds: [],
            },
            [NetworkPluginID.PLUGIN_FLOW]: {
                supportedChainIds: [],
            },
        },
    },
    contribution: { postContent: new Set([/https:\/\/app.cyberconnect.me/]) },
}
