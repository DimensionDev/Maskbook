import type { Web3Plugin } from '@masknet/plugin-infra'
import { NetworkType, ProviderType } from '@masknet/web3-shared-flow/types'

export const PLUGIN_META_KEY = 'com.mask.flow'
export const PLUGIN_ID = 'com.mask.flow'
export const PLUGIN_NAME = 'Flow Chain'
export const PLUGIN_ICON = '⚙️'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_flow`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('./assets/flow.png', import.meta.url),
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('./assets/blocto.png', import.meta.url),
    },
]
