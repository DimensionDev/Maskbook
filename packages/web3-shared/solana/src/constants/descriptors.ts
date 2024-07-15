import { EnhanceableSiteList, NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainDescriptor,
    createFungibleToken,
    type NetworkDescriptor,
    type ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { ChainIdList, getTokenConstant } from './constants.js'

const PLUGIN_ID = NetworkPluginID.PLUGIN_SOLANA

export const CHAIN_DESCRIPTORS: ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>> = [
    {
        ID: `${ChainId.Mainnet}_Solana`,
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
            getTokenConstant(ChainId.Mainnet, 'SOL_ADDRESS', ''),
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerUrl: {
            url: 'https://explorer.solana.com/',
        },
        rpcUrl: '',
        iconUrl: new URL('../assets/solana.png', import.meta.url).href,
        isCustomized: false,
    },
    {
        ID: `${ChainId.Devnet}_Solana`,
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
            getTokenConstant(ChainId.Devnet, 'SOL_ADDRESS', ''),
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerUrl: {
            url: 'https://explorer.solana.com/',
            parameters: {
                cluster: 'devnet',
            },
        },
        rpcUrl: '',
        iconUrl: new URL('../assets/solana.png', import.meta.url).href,
        isCustomized: false,
    },
    {
        ID: `${ChainId.Testnet}_Solana`,
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
            getTokenConstant(ChainId.Testnet, 'SOL_ADDRESS', ''),
            'Solana',
            'SOL',
            9,
            'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        ),
        explorerUrl: {
            url: 'https://explorer.solana.com/',
            parameters: {
                cluster: 'testnet',
            },
        },
        rpcUrl: '',
        iconUrl: new URL('../assets/solana.png', import.meta.url).href,
        isCustomized: false,
    },
]

export const NETWORK_DESCRIPTORS: ReadonlyArray<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('../assets/solana.png', import.meta.url).href,
        iconColor: '#5d6fc0',
        averageBlockDelay: 15,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_solana_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Solana,
        name: 'Solana Testnet',
        icon: new URL('../assets/solana.png', import.meta.url).href,
        iconColor: '#5d6fc0',
        averageBlockDelay: 15,
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_phantom`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Phantom,
        name: 'Phantom',
        icon: new URL('../assets/phantom.png', import.meta.url).href,
        homeLink: 'https://phantom.app/',
        shortenLink: 'phantom.app',
        downloadLink: 'https://phantom.app/download',
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
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
        icon: new URL('../assets/solflare.png', import.meta.url).href,
        homeLink: 'https://solflare.com/',
        shortenLink: 'solflare.com',
        downloadLink: 'https://solflare.com/download',
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: [],
            supportedExtensionSites: [],
        },
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coin98,
        name: 'Coin98',
        icon: new URL('../assets/coin98.png', import.meta.url).href,
        homeLink: 'https://coin98.com/',
        shortenLink: 'solflare.com',
        downloadLink: 'https://coin98.com/wallet',
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: [],
            supportedExtensionSites: [],
        },
    },
]
