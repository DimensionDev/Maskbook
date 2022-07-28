import type { Plugin } from '@masknet/plugin-infra'
import { OthersState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    ChainId,
    formatAddress,
    ProviderType,
    NetworkType,
    Transaction,
    SchemaType,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    formatTokenId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
    getZeroAddress,
    getMaskTokenAddress,
    getNativeTokenAddress,
    explorerResolver,
} from '@masknet/web3-shared-solana'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override explorerResolver = explorerResolver

    override isValidDomain = isValidDomain
    override isValidAddress = isValidAddress
    override isSameAddress = isSameAddress
    override isZeroAddress = isZeroAddress

    override getDefaultChainId = getDefaultChainId
    override getDefaultNetworkType = getDefaultNetworkType
    override getDefaultProviderType = getDefaultProviderType
    override getZeroAddress = getZeroAddress
    override getMaskTokenAddress = getMaskTokenAddress
    override getNativeTokenAddress = getNativeTokenAddress

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
}
