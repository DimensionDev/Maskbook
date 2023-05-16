import type { Plugin } from '@masknet/plugin-infra'
import { createExplorerResolver, createFungibleToken, createNonFungibleToken } from '@masknet/web3-shared-base'
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
    formatTokenId,
    createNativeToken,
    isValidChainId,
} from '@masknet/web3-shared-flow'
import { OthersState } from '../../Base/state/Others.js'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override explorerResolver = createExplorerResolver(this.options.chainDescriptors, {
        addressPathname: '/account/:address',
        transactionPathname: '/transaction/:id',
        fungibleTokenPathname: '/contract/:address',
        nonFungibleTokenPathname: '/contract/:address',
    })

    resolveFungibleTokenLink(chainId: ChainId, address: string): string {
        throw new Error('Method not implemented.')
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
    override getNativeTokenAddress = getNativeTokenAddress
    override getMaskTokenAddress = getMaskTokenAddress

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
    override formatSchemaType = formatSchemaType
    override createNativeToken = createNativeToken
    override createFungibleToken = createFungibleToken
    override createNonFungibleToken = createNonFungibleToken
}
