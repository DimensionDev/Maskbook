import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export const PLUGIN_META_KEY = 'com.mask.terra'
export const PLUGIN_ID = 'com.mask.terra'
export const PLUGIN_NAME = 'Terra Chain'
export const PLUGIN_ICON = '🛰️'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_terra`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.ColumbusMainnet,
        type: NetworkType.Terra,
        name: 'Terra',
        icon: new URL('./assets/terra.png', import.meta.url),
        iconColor: 'rgb(83 148 248)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_terra`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.VodkaTestnet,
        type: NetworkType.Terra,
        name: 'Terra',
        icon: new URL('./assets/terra.png', import.meta.url),
        iconColor: 'rgb(83 148 248)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_terra`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.SojuTestnet,
        type: NetworkType.Terra,
        name: 'Terra',
        icon: new URL('./assets/terra.png', import.meta.url),
        iconColor: 'rgb(83 148 248)',
        isMainnet: true,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_terrastation`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.TerraStation,
        name: 'TerraStation',
        icon: new URL('./assets/TerraStation.png', import.meta.url),
    },
]
