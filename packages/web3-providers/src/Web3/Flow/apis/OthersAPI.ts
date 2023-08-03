import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    type ChainId,
    formatAddress,
    formatDomainName,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    formatTokenId,
    isValidChainId,
    getNetworkPluginID,
} from '@masknet/web3-shared-flow'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import {
    FlowChainResolverAPI,
    FlowExplorerResolverAPI,
    FlowProviderResolverAPI,
    FlowNetworkResolverAPI,
} from './ResolverAPI.js'

export class FlowOthersAPI extends OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    override chainResolver = new FlowChainResolverAPI()
    override explorerResolver = new FlowExplorerResolverAPI()
    override providerResolver = new FlowProviderResolverAPI()
    override networkResolver = new FlowNetworkResolverAPI()

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
    override getNativeTokenAddress = getNativeTokenAddress
    override getMaskTokenAddress = getMaskTokenAddress

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
    override formatSchemaType = formatSchemaType
    override createNativeToken = (chainId: ChainId) => this.chainResolver.nativeCurrency(chainId)
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
