import { EnhanceableSiteList, ExtensionSiteList, NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainDescriptor,
    createFungibleToken,
    type NetworkDescriptor,
    type ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { ChainIdList } from './constants.js'

const PLUGIN_ID = NetworkPluginID.PLUGIN_FLOW

export const CHAIN_DESCRIPTORS: ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>> = [
    {
        ID: `${ChainId.Mainnet}_Flow`,
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
        explorerUrl: {
            url: 'https://flowscan.org/',
        },
        rpcUrl: '',
        isCustomized: false,
    },
    {
        ID: `${ChainId.Testnet}_Flow`,
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
        explorerUrl: {
            url: 'https://testnet.flowscan.org/',
        },
        rpcUrl: '',
        isCustomized: false,
    },
]

export const NETWORK_DESCRIPTORS: ReadonlyArray<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_flow`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Flow,
        name: 'Flow',
        icon: new URL('../assets/flow.png', import.meta.url).href,
        iconColor: 'rgb(54, 173, 104)',
        averageBlockDelay: 15,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_flow_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Testnet,
        type: NetworkType.Flow,
        name: 'Flow Testnet',
        icon: new URL('../assets/flow.png', import.meta.url).href,
        iconColor: 'rgb(54, 173, 104)',
        averageBlockDelay: 15,
        isMainnet: false,
    },
]
export const PROVIDER_DESCRIPTORS: ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_blocto`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Blocto,
        name: 'Blocto',
        icon: new URL('../assets/blocto.png', import.meta.url).href,
        iconFilterColor: 'rgba(52, 133, 196, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(52, 133, 196, 0.2) 0%, rgba(0, 239, 139, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
        homeLink: 'https://portto.com/',
        // cspell: disable-next-line
        shortenLink: 'portto.com',
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
    },
]
