import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { pluginDescription, pluginName, pluginId, pluginMetaKey } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: pluginId,
    name: { fallback: pluginName },
    description: { fallback: pluginDescription },
    publisher: { name: { fallback: 'Zubin Choudhary' }, link: 'https://www.iamzub.in' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.xDai, ChainId.Matic, ChainId.Rinkeby, ChainId.Optimistic],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    contribution: {
        metadataKeys: new Set([pluginMetaKey]),
    },
}
