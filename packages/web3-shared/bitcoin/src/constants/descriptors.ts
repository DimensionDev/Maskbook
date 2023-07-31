import {
    createFungibleToken,
    type ChainDescriptor,
    type NetworkDescriptor,
    type ProviderDescriptor,
} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ZERO_ADDRESS } from './primitives.js'
import { ChainId, NetworkType, type ProviderType, SchemaType } from '../types/index.js'

const PLUGIN_ID = NetworkPluginID.PLUGIN_BITCOIN

export const CHAIN_DESCRIPTORS: Array<ChainDescriptor<ChainId, SchemaType, NetworkType>> = [
    {
        ID: `${ChainId.Mainnet}_Bitcoin`,
        type: NetworkType.Mainnet,
        chainId: ChainId.Mainnet,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        name: 'Bitcoin',
        color: '#f7931a',
        fullName: 'Bitcoin',
        shortName: 'Bitcoin',
        network: 'mainnet',
        nativeCurrency: createFungibleToken(
            ChainId.Mainnet,
            SchemaType.Native,
            ZERO_ADDRESS,
            'Bitcoin',
            'BTC',
            8,
            new URL('../assets/bitcoin.png', import.meta.url).href,
        ),
        explorerUrl: {
            url: 'https://www.blockchain.com/explorer',
        },
        rpcUrl: '',
        isCustomized: false,
    },
]

export const NETWORK_DESCRIPTORS: Array<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_bitcoin`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Mainnet,
        name: 'Bitcoin',
        shortName: 'BTC',
        icon: new URL('../assets/bitcoin.png', import.meta.url).href,
        iconColor: 'rgb(247, 147, 26)',
        averageBlockDelay: 10,
        backgroundGradient:
            'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%), rgba(255, 255, 255, 0.2)',
        isMainnet: true,
    },
]
export const PROVIDER_DESCRIPTORS: Array<ProviderDescriptor<ChainId, ProviderType>> = []
