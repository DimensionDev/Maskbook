import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { FIND_TRUMAN_PLUGIN_ID, FIND_TRUMAN_PLUGIN_NAME } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: FIND_TRUMAN_PLUGIN_ID,
    name: { fallback: FIND_TRUMAN_PLUGIN_NAME },
    description: {
        fallback: 'A plugin for https://findtruman.io/',
    },
    publisher: { name: { fallback: 'FindTruman' }, link: 'https://findtruman.io/' },
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
                    ChainId.Fantom,
                    ChainId.Avalanche,
                    ChainId.Aurora,
                    ChainId.Conflux,
                    ChainId.Astar,
                    ChainId.Harmony,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        postContent: new Set([
            /https:\/\/findtruman.io\/#\/(findtruman\/stories\/[\dA-Za-z]+(\/|\/(puzzles|polls|puzzle_result|poll_result)\/[\dA-Za-z]+\/?)?|encryption\?payload=.+)/,
        ]),
    },
}
