import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidBitcoinAddress,
    isZeroAddress,
    isNativeTokenSchemaType,
    formatBitcoinAddress,
    type ChainId,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    formatSchemaType,
    isValidChainId,
} from '@masknet/web3-shared-bitcoin'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import {
    BitcoinChainResolverAPI,
    BitcoinExplorerResolverAPI,
    BitcoinProviderResolverAPI,
    BitcoinNetworkResolverAPI,
} from './ResolverAPI.js'

export class BitcoinOthersAPI extends OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    override chainResolver = new BitcoinChainResolverAPI()
    override explorerResolver = new BitcoinExplorerResolverAPI()
    override providerResolver = new BitcoinProviderResolverAPI()
    override networkResolver = new BitcoinNetworkResolverAPI()

    override isValidDomain = () => false
    override isValidChainId = isValidChainId
    override isValidAddress = isValidBitcoinAddress
    override isZeroAddress = isZeroAddress
    override isNativeTokenAddress = isZeroAddress

    override isNativeTokenSchemaType = isNativeTokenSchemaType
    override isFungibleTokenSchemaType = isNativeTokenSchemaType
    override isNonFungibleTokenSchemaType = (schemaType: SchemaType) => !isNativeTokenSchemaType(schemaType)

    override getNetworkPluginID = getNetworkPluginID
    override getDefaultChainId = getDefaultChainId
    override getInvalidChainId = getInvalidChainId
    override getDefaultNetworkType = getDefaultNetworkType
    override getDefaultProviderType = getDefaultProviderType
    override getZeroAddress = getZeroAddress
    override getMaskTokenAddress = () => ''
    override getNativeTokenAddress = getZeroAddress

    override formatAddress = formatBitcoinAddress
    override formatDomainName = formatDomainName
    override formatTokenId = () => ''
    override formatSchemaType = formatSchemaType
    override createNativeToken = (chainId: ChainId) => new BitcoinChainResolverAPI().nativeCurrency(chainId)
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
