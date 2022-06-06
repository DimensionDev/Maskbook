import { getEnumAsArray } from '@dimensiondev/kit'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    ChainDescriptor,
    createFungibleToken,
    NetworkDescriptor,
    NetworkPluginID,
    ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types'
import { ZERO_ADDRESS } from './primitives'

const PLUGIN_ID = NetworkPluginID.PLUGIN_SOLANA

export const CHAIN_DESCRIPTORS: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>> = [
    {
        type: NetworkType.Solana,
        chainId: ChainId.Mainnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Solana',
        color: '#17ac7c',
        fullName: 'Solana',
        shortName: 'Solana',
        network: 'mainnet',
        nativeCurrency: createFungibleToken(
            ChainId.Mainnet,
            SchemaType.Fungible,
            ZERO_ADDRESS,
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerURL: {
            url: 'https://explorer.solana.com/',
        },
    },
    {
        type: NetworkType.Solana,
        chainId: ChainId.Devnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Solana',
        color: '#17ac7c',
        fullName: 'Solana',
        shortName: 'Solana',
        network: 'devnet',
        nativeCurrency: createFungibleToken(
            ChainId.Devnet,
            SchemaType.Fungible,
            ZERO_ADDRESS,
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerURL: {
            url: 'https://explorer.solana.com/',
            parameters: {
                cluster: 'devnet',
            },
        },
    },
    {
        type: NetworkType.Solana,
        chainId: ChainId.Testnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Solana',
        color: '#17ac7c',
        fullName: 'Solana',
        shortName: 'Solana',
        network: 'testnet',
        nativeCurrency: createFungibleToken(
            ChainId.Testnet,
            SchemaType.Fungible,
            ZERO_ADDRESS,
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerURL: {
            url: 'https://explorer.solana.com/',
            parameters: {
                cluster: 'testnet',
            },
        },
    },
]

export const NETWORK_DESCRIPTORS: Array<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('../assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_solana_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Solana,
        name: 'Solana Testnet',
        icon: new URL('../assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: Array<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_phantom`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Phantom,
        name: 'Phantom',
        icon: new URL('../assets/phantom.png', import.meta.url),
        homeLink: 'https://phantom.app/',
        shortenLink: 'phantom.app',
        downloadLink: 'https://phantom.app/download',
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: [],
        },
        iconFilterColor: 'rgba(85, 27, 249, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(84, 63, 196, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_solflare`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Solflare,
        name: 'Solflare',
        icon: new URL('../assets/solflare.png', import.meta.url),
        homeLink: 'https://solflare.com/',
        shortenLink: 'solflare.com',
        downloadLink: 'https://solflare.com/download',
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: [],
        },
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coin98,
        name: 'Coin98',
        icon: new URL('../assets/coin98.png', import.meta.url),
        homeLink: 'https://coin98.com/',
        shortenLink: 'solflare.com',
        downloadLink: 'https://solflare.com/download',
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: [],
        },
    },
    {
        ID: `${PLUGIN_ID}_sollet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Sollet,
        name: 'Sollet',
        icon: new URL('../assets/sollet.png', import.meta.url),
        homeLink: 'https://www.sollet.io/',
        shortenLink: 'sollet.io',
        downloadLink: 'https://www.sollet.io/',
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
    },
]
