import { NetworkPluginID } from '@masknet/shared-base'
import {
    type ChainDescriptor,
    createFungibleToken,
    type NetworkDescriptor,
    type ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types.js'
import { getTokenConstant } from './constants.js'

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
]
export const PROVIDER_DESCRIPTORS: ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>> = []
