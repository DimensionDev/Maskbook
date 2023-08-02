import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    type ChainId,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    formatAddress,
    formatTokenId,
    getNetworkPluginID,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    formatSchemaType,
    createNativeToken,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import { SolanaExplorerResolverAPI } from './ExplorerResolverAPI.js'
import { SolanaChainResolverAPI } from './ChainResolverAPI.js'
import { SolanaProviderResolverAPI } from './ProviderResolverAPI.js'
import { SolanaNetworkResolverAPI } from './NetworkExplorerAPI.js'

export class SolanaOthersAPI extends OthersAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    chainResolver = new SolanaChainResolverAPI()
    explorerResolver = new SolanaExplorerResolverAPI()
    providerResolver = new SolanaProviderResolverAPI()
    networkResolver = new SolanaNetworkResolverAPI()

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

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
    override formatSchemaType = formatSchemaType
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
