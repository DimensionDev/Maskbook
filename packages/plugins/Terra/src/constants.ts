import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-terra'

export const PLUGIN_META_KEY = 'com.mask.terra'
export const PLUGIN_ID = 'com.mask.terra'
export const PLUGIN_NAME = 'Terra Chain'
export const PLUGIN_ICON = '\u{1F305}'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_terra`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Terra,
        name: 'Solana',
        icon: new URL('./assets/terra.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_terra_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Terra,
        name: 'Solana Testnet',
        icon: new URL('./assets/terra.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: false,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_terrastation`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.TerraStation,
        name: 'Phantom',
        icon: new URL('./assets/terrastation.png', import.meta.url),
    },
]

export const NETWORK_ENDPOINTS: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'http://public-node.terra.dev:26657/',
    [ChainId.Testnet]: 'http://public-node.terra.dev:26657/',
}
export const ENDPOINT_KEY = 'mainnet-beta'
