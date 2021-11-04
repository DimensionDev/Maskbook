import { NetworkType, ProviderType } from '@masknet/web3-shared-flow/types'

export const PLUGIN_META_KEY = 'com.maskbook.flow'
export const PLUGIN_ID = 'com.maskbook.flow'
export const PLUGIN_NAME = 'Flow Chain'
export const PLUGIN_ICON = 'F'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS = [
    {
        ID: `${PLUGIN_ID}_flow`,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('./assets/flow.png', import.meta.url).toString(),
    },
]
export const PLUGIN_PROVIDERS = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('./assets/blocto.png', import.meta.url).toString(),
    },
]
