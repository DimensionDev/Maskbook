import type { Plugin } from '@masknet/plugin-infra'
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
    formatAddress,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type SchemaType,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    formatTokenId,
    getDefaultChainId,
    getInvalidChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    explorerResolver,
    formatSchemaType,
    createNativeToken,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
import { OthersState } from '../../Base/state/Others.js'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override explorerResolver = explorerResolver

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

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
    override formatSchemaType = formatSchemaType
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
