import type { Plugin } from '@masknet/plugin-infra'
import { OthersState } from '@masknet/web3-state'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    isNativeTokenSchemaType,
    isFungibleTokenSchemaType,
    isNonFungibleTokenSchemaType,
    ChainId,
    formatEthereumAddress,
    formatDomainName,
    formatTokenId,
    getTransactionSignature,
    ProviderType,
    NetworkType,
    Transaction,
    SchemaType,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
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
} from '@masknet/web3-shared-evm'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override isValidDomain = isValidDomain
    override isValidChainId = isValidChainId
    override isValidAddress = isValidAddress
    override isZeroAddress = isZeroAddress
    override isNativeTokenAddress = isNativeTokenAddress
    override isNativeTokenSchemaType = isNativeTokenSchemaType
    override isFungibleTokenSchemaType = isFungibleTokenSchemaType
    override isNonFungibleTokenSchemaType = isNonFungibleTokenSchemaType

    override getDefaultChainId = getDefaultChainId
    override getInvalidChainId = getInvalidChainId
    override getDefaultNetworkType = getDefaultNetworkType
    override getDefaultProviderType = getDefaultProviderType
    override getZeroAddress = getZeroAddress
    override getMaskTokenAddress = getMaskTokenAddress
    override getNativeTokenAddress = getNativeTokenAddress
    override getTransactionSignature = getTransactionSignature

    override formatAddress = formatEthereumAddress
    override formatTokenId = formatTokenId
    override formatDomainName = formatDomainName
    override formatSchemaType = formatSchemaType
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
