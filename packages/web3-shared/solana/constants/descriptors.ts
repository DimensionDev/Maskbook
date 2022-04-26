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

export const CHAIN_DESCRIPTORS: ChainDescriptor<ChainId, SchemaType, NetworkType>[] = [
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
        infoURL: {
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
        infoURL: {
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
        infoURL: {
            url: 'https://explorer.solana.com/',
            parameters: {
                cluster: 'testnet',
            },
        },
    },
]

export const NETWORK_DESCRIPTORS: NetworkDescriptor<ChainId, NetworkType>[] = [
    {
        ID: `${PLUGIN_ID}_solana`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Solana,
        name: 'Solana',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_solana_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Solana,
        name: 'Solana Testnet',
        icon: new URL('./assets/solana.png', import.meta.url),
        iconColor: '#5d6fc0',
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: ProviderDescriptor<ChainId, ProviderType>[] = [
    {
        ID: `${PLUGIN_ID}_phantom`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Phantom,
        name: 'Phantom',
        icon: new URL('./assets/phantom.png', import.meta.url),
        homeLink: 'https://phantom.app/',
        shortenLink: 'phantom.app',
        downloadLink: 'https://phantom.app/download',
    },
]
