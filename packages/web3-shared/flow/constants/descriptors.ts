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

const PLUGIN_ID = NetworkPluginID.PLUGIN_FLOW

export const CHAIN_DESCRIPTORS: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>> = [
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
        explorerURL: {
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
        explorerURL: {
            url: 'https://testnet.flowscan.org/',
        },
    },
]

export const NETWORK_DESCRIPTORS: Array<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_flow`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('../assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_flow_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Flow,
        name: 'Flow Testnet',
        icon: new URL('../assets/flow.png', import.meta.url),
        iconColor: 'rgb(54, 173, 104)',
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: Array<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('../assets/blocto.png', import.meta.url),
        iconFilterColor: 'rgba(52, 133, 196, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(52, 133, 196, 0.2) 0%, rgba(0, 239, 139, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
        homeLink: 'https://portto.com/',
        shortenLink: 'portto.com',
        enableRequirements: {
            supportedChainIds: getEnumAsArray(ChainId).map((x) => x.value),
            supportedEnhanceableSites: getEnumAsArray(EnhanceableSite).map((x) => x.value),
            supportedExtensionSites: getEnumAsArray(ExtensionSite).map((x) => x.value),
        },
    },
]
