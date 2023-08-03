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
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
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
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import { OthersAPI_Base } from '../../Base/apis/OthersAPI.js'
import {
    SolanaChainResolver,
    SolanaExplorerResolver,
    SolanaProviderResolver,
    SolanaNetworkResolver,
} from './ResolverAPI.js'

export class SolanaOthersAPI extends OthersAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    override get chainResolver() {
        return SolanaChainResolver
    }
    override get explorerResolver() {
        return SolanaExplorerResolver
    }
    override get providerResolver() {
        return SolanaProviderResolver
    }
    override get networkResolver() {
        return SolanaNetworkResolver
    }

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
    override createNativeToken = (chainId: ChainId) => this.chainResolver.nativeCurrency(chainId)
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
