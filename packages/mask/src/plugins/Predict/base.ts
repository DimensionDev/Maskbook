import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { PREDICT_PLUGIN_NAME } from './constants'
import { PluginId } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.Predict,
    name: { fallback: PREDICT_PLUGIN_NAME },
    description: {
        fallback: 'A plugin for Predict Market',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-out',
            networks: {},
        },
        target: 'beta',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Sokol],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    experimentalMark: true,
}
