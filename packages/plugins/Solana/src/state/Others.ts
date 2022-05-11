import type { Plugin } from '@masknet/plugin-infra'
import { OthersState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatBalance, formatCurrency, formatDomainName } from '@masknet/web3-shared-evm'
import {
    isValidDomain,
    isValidAddress,
    ChainId,
    formatAddress,
    ProviderType,
    NetworkType,
    SchemaType,
    ZERO_ADDRESS,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
} from '@masknet/web3-shared-solana'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType> {
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

    override formatAddress = formatAddress
    override formatCurrency = formatCurrency
    override formatBalance = formatBalance
    override formatDomainName = formatDomainName
}
