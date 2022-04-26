import {
    ChainDescriptor,
    createFungibleToken,
    NetworkDescriptor,
    NetworkPluginID,
    ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types'

const PLUGIN_ID = NetworkPluginID.PLUGIN_FLOW

export const CHAIN_DESCRIPTORS: ChainDescriptor<ChainId, SchemaType, NetworkType>[] = [
    {
        type: NetworkType.Flow,
        chainId: ChainId.Mainnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Flow',
        color: '#16ff99',
        fullName: 'Flow',
        shortName: 'Flow',
        network: 'mainnet',
        nativeCurrency: createFungibleToken(
            ChainId.Mainnet,
            SchemaType.Fungible,
            '0x1654653399040a61',
            'Flow',
            'FLOW',
            8,
            'https://static.flowscan.org/mainnet/icons/A.1654653399040a61.FlowToken.png',
        ),
        infoURL: {
            url: 'https://flowscan.org/',
        },
    },
    {
        type: NetworkType.Flow,
        chainId: ChainId.Testnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Flow',
        color: '#16ff99',
        fullName: 'Flow',
        shortName: 'Flow',
        network: 'testnet',
        nativeCurrency: createFungibleToken(
            ChainId.Mainnet,
            SchemaType.Fungible,
            '0x7e60df042a9c0868',
            'Flow',
            'FLOW',
            8,
            'https://static.flowscan.org/mainnet/icons/A.1654653399040a61.FlowToken.png',
        ),
        infoURL: {
            url: 'https://testnet.flowscan.org/',
        },
    },
]

export const NETWORK_DESCRIPTORS: NetworkDescriptor<ChainId, NetworkType>[] = [
    {
        ID: `${PLUGIN_ID}_flow`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('./assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_flow_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Flow,
        name: 'Flow Testnet',
        icon: new URL('./assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: ProviderDescriptor<ChainId, ProviderType>[] = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('./assets/blocto.png', import.meta.url),
        homeLink: 'https://portto.com/',
        shortenLink: 'portto.com',
    },
]
