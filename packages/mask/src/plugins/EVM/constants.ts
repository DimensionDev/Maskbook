import type { Web3Plugin } from '@masknet/plugin-infra/src'
import { NetworkType, ProviderType } from '@masknet/web3-shared-evm'

export const PLUGIN_META_KEY = 'com.maskbook.evm'
export const PLUGIN_ID = 'com.maskbook.evm'
export const PLUGIN_NAME = 'EVM'
export const PLUGIN_ICON = 'Ξ'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_ethereum`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.Ethereum,
        name: 'Ethereum',
        icon: new URL('./assets/ethereum.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_bsc`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.Binance,
        name: 'BSC',
        icon: new URL('./assets/binance.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_polygon`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.Polygon,
        name: 'Polygon',
        icon: new URL('./assets/polygon.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_arbitrum`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum One',
        icon: new URL('./assets/arbitrum.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_xdai`,
        networkSupporterPluginID: PLUGIN_ID,
        type: NetworkType.xDai,
        name: 'xDai',
        icon: new URL('./assets/xdai.png', import.meta.url),
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_maskwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MaskWallet,
        name: 'Mask Network',
        icon: new URL('./assets/maskwallet.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_metamask`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MetaMask,
        name: 'MetaMask',
        icon: new URL('./assets/metamask.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_walletconnect`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletConnect,
        name: 'WalletConnect',
        icon: new URL('./assets/walletconnect.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Injected,
        name: 'Coin98',
        icon: new URL('./assets/coin98.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_walletlink`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Injected,
        name: 'Coinbase',
        icon: new URL('./assets/coinbase.png', import.meta.url),
    },
    {
        ID: `${PLUGIN_ID}_mathwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Injected,
        name: 'MathWallet',
        icon: new URL('./assets/mathwallet.png', import.meta.url),
    },
]
