import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    formatEthereumAddress,
    formatDomainName,
    formatTokenId,
    getTransactionSignature,
    type ChainId,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
    type SchemaType,
    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    getAverageBlockDelay,
    formatSchemaType,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import { ChainResolver, ExplorerResolver, ProviderResolver, NetworkResolver } from './ResolverAPI.js'

export class OthersAPI extends OthersAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    override chainResolver = ChainResolver
    override explorerResolver = ExplorerResolver
    override providerResolver = ProviderResolver
    override networkResolver = NetworkResolver

    override isValidDomain = isValidDomain
    override isValidChainId = isValidChainId
    override isValidAddress = isValidAddress
    override isZeroAddress = isZeroAddress
    override isNativeTokenAddress = isNativeTokenAddress
    override isNativeTokenSchemaType = isNativeTokenSchemaType
    override isFungibleTokenSchemaType = isFungibleTokenSchemaType
    override isNonFungibleTokenSchemaType = isNonFungibleTokenSchemaType

    override getNetworkPluginID = getNetworkPluginID
    override getDefaultChainId = getDefaultChainId
    override getInvalidChainId = getInvalidChainId
    override getDefaultNetworkType = getDefaultNetworkType
    override getDefaultProviderType = getDefaultProviderType
    override getZeroAddress = getZeroAddress
    override getMaskTokenAddress = getMaskTokenAddress
    override getNativeTokenAddress = getNativeTokenAddress
    override getTransactionSignature = getTransactionSignature
    override getAverageBlockDelay = getAverageBlockDelay

    override formatAddress = formatEthereumAddress
    override formatTokenId = formatTokenId
    override formatDomainName = formatDomainName
    override formatSchemaType = formatSchemaType
    override createNativeToken = (chainId: ChainId) => ChainResolver.nativeCurrency(chainId)
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
