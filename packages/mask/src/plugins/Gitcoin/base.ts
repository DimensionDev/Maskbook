import { NetworkPluginID, Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { PLUGIN_ID, PLUGIN_ICON, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: PLUGIN_ICON,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic, ChainId.Mumbai],
            },
        },
    },
}
