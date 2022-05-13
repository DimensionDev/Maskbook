import { PluginId } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-flow/types'

export const PLUGIN_ID = PluginId.Flow
export const PLUGIN_NAME = 'Flow Chain'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_flow`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('./assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_flow_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Flow,
        name: 'Flow Testnet',
        icon: new URL('./assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: false,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('./assets/blocto.png', import.meta.url),
        backgroundGradient:
            'linear-gradient(90deg, rgba(52, 133, 196, 0.2) 0%, rgba(0, 239, 139, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
]
