import { getEnumAsArray } from '@dimensiondev/kit'
import { PluginId, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = PluginId.EVM
export const PLUGIN_META_KEY = `${PluginId.EVM}:1`
export const PLUGIN_NAME = 'EVM'
export const PLUGIN_ICON = '\u039E'
export const PLUGIN_DESCRIPTION = ''
export const PLUGIN_NETWORKS: Web3Plugin.NetworkDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_ethereum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Ethereum,
        name: 'Ethereum',
        icon: new URL('./assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(28, 104, 243)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_ropsten`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Ropsten,
        type: NetworkType.Ethereum,
        name: 'Ropsten',
        icon: new URL('./assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(255, 65, 130)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_kovan`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Kovan,
        type: NetworkType.Ethereum,
        name: 'Kovan',
        icon: new URL('./assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(133, 89, 255)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Rinkeby,
        type: NetworkType.Ethereum,
        name: 'Rinkeby',
        icon: new URL('./assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(133, 89, 255)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_gorli`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Gorli,
        type: NetworkType.Ethereum,
        name: 'G\xf6rli',
        icon: new URL('./assets/ethereum.png', import.meta.url),
        iconColor: 'rgb(48, 153, 242)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_bsc`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSC,
        type: NetworkType.Binance,
        name: 'BNB Chain',
        icon: new URL('./assets/binance.png', import.meta.url),
        iconColor: 'rgb(240, 185, 10)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_bsct`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSCT,
        type: NetworkType.Binance,
        name: 'BSCT',
        icon: new URL('./assets/binance.png', import.meta.url),
        iconColor: 'rgb(240, 185, 10)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_polygon`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Matic,
        type: NetworkType.Polygon,
        name: 'Polygon',
        icon: new URL('./assets/polygon.png', import.meta.url),
        iconColor: 'rgb(119, 62, 225)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_mumbai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mumbai,
        type: NetworkType.Polygon,
        name: 'Mumbai',
        icon: new URL('./assets/polygon.png', import.meta.url),
        iconColor: 'rgb(119, 62, 225)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum One',
        icon: new URL('./assets/arbitrum.png', import.meta.url),
        iconColor: 'rgb(36, 150, 238)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum_Rinkeby,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum Rinkeby',
        icon: new URL('./assets/arbitrum.png', import.meta.url),
        iconColor: 'rgb(36, 150, 238)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_xdai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.xDai,
        type: NetworkType.xDai,
        name: 'Gnosis',
        icon: new URL('./assets/xdai.png', import.meta.url),
        iconColor: 'rgb(73, 169, 166)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_celo`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Celo,
        type: NetworkType.Celo,
        name: 'Celo',
        icon: new URL('./assets/celo.png', import.meta.url),
        iconColor: 'rgb(53, 208, 127)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_fantom`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Fantom,
        type: NetworkType.Fantom,
        name: 'Fantom',
        icon: new URL('./assets/fantom.png', import.meta.url),
        iconColor: 'rgb(73, 169, 166)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_avalanche`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Avalanche,
        type: NetworkType.Avalanche,
        name: 'Avalanche',
        icon: new URL('./assets/avalanche.png', import.meta.url),
        iconColor: 'rgb(232, 65, 66)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_aurora`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Aurora,
        type: NetworkType.Aurora,
        name: 'Aurora',
        icon: new URL('./assets/aurora.png', import.meta.url),
        iconColor: 'rgb(112, 212, 74)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_conflux`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Conflux,
        type: NetworkType.Conflux,
        name: 'Conflux',
        icon: new URL('./assets/conflux.png', import.meta.url),
        iconColor: 'rgb(112, 212, 74)',
        isMainnet: true,
    },
]
export const PLUGIN_PROVIDERS: Web3Plugin.ProviderDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_maskwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MaskWallet,
        name: 'Mask Network',
        icon: new URL('./assets/maskwallet.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_metamask`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MetaMask,
        name: 'MetaMask',
        icon: new URL('./assets/metamask.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_walletconnect`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletConnect,
        name: 'WalletConnect',
        icon: new URL('./assets/walletconnect.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coin98,
        name: 'Coin98',
        icon: new URL('./assets/coin98.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_walletlink`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletLink,
        name: 'Coinbase',
        icon: new URL('./assets/coinbase.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_mathwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MathWallet,
        name: 'MathWallet',
        icon: new URL('./assets/mathwallet.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
        },
    },
    {
        ID: `${PLUGIN_ID}_fortmatic`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Fortmatic,
        name: 'Fortmatic',
        icon: new URL('./assets/fortmatic.png', import.meta.url),
        enableRequirements: {
            supportedChainIds: [ChainId.Mainnet, ChainId.BSC],
        },
    },
]
export const PLUGIN_APPLICATION_CATEGORIES: Web3Plugin.ApplicationCategoryDescriptor[] = [
    {
        ID: `${PLUGIN_ID}_category_nfts`,
        name: 'NFTs',
        icon: new URL('./assets/nfts.png', import.meta.url),
    },
]
