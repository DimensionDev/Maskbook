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
    type Transaction,
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
    createNativeToken,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import { ChainResolverAPI } from './ChainResolverAPI.js'
import { ExplorerResolverAPI } from './ExplorerResolverAPI.js'
import { ProviderResolverAPI } from './ProviderResolverAPI.js'
import { NetworkResolverAPI } from './NetworkExplorerAPI.js'

export class OthersAPI extends OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    chainResolver = new ChainResolverAPI()
    explorerResolver = new ExplorerResolverAPI()
    providerResolver = new ProviderResolverAPI()
    networkResolver = new NetworkResolverAPI()

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
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
