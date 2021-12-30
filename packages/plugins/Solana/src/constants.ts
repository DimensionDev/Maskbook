import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export const PLUGIN_META_KEY = 'com.mask.solana'
export const PLUGIN_ID = 'com.mask.solana'
export const PLUGIN_NAME = 'Solana Chain'
export const PLUGIN_ICON = '🌅'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.MainnetBeta,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: 'rgb(54 173 104)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Solana,
        name: 'Solana Testnet',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: 'rgb(54 173 104)',
        isMainnet: false,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_sollet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Sollet,
        name: 'Sollet',
        icon: new URL('./assets/Sollet.png', import.meta.url),
    },
]
