import type { Plugin } from '@masknet/plugin-infra'
import { OthersState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidDomain,
    isValidAddress,
    isZeroAddress,
    isNativeTokenAddress,
    ChainId,
    formatEthereumAddress,
    formatDomainName,
    formatTokenId,
    getTransactionSignature,
    ProviderType,
    NetworkType,
    Transaction,
    SchemaType,
    ZERO_ADDRESS,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    getMaskTokenAddress,
} from '@masknet/web3-shared-evm'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType, Transaction> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            defaultAddress: ZERO_ADDRESS,
            defaultBlockDelay: 15,
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override isValidDomain = isValidDomain
    override isValidAddress = isValidAddress
    override isSameAddress = isSameAddress
    override isZeroAddress = isZeroAddress
    override isNativeTokenAddress = isNativeTokenAddress

    override getMaskTokenAddress = getMaskTokenAddress
    override getTransactionSignature = getTransactionSignature

    override formatAddress = formatEthereumAddress
    override formatTokenId = formatTokenId
    override formatDomainName = formatDomainName
}
