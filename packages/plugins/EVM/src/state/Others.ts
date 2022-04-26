import type { Plugin } from '@masknet/plugin-infra'
import { OthersState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    isValidDomain,
    isValidAddress,
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    formatDomainName,
    ProviderType,
    NetworkType,
    SchemaType,
    ZERO_ADDRESS,
    formatTokenId,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
} from '@masknet/web3-shared-evm'

export class Others extends OthersState<ChainId, SchemaType, ProviderType, NetworkType> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            defaultAddress: ZERO_ADDRESS,
            defaultChainId: ChainId.Mainnet,
            defaultNetworkType: NetworkType.Ethereum,
            defaultBlockDelay: 15,
            chainDescriptors: CHAIN_DESCRIPTORS,
            networkDescriptors: NETWORK_DESCRIPTORS,
            providerDescriptors: PROVIDER_DESCRIPTORS,
        })
    }

    override isValidDomain = isValidDomain
    override isValidAddress = isValidAddress
    override isSameAddress = isSameAddress

    override formatAddress = formatEthereumAddress
    override formatTokenId = formatTokenId
    override formatCurrency = formatCurrency
    override formatBalance = formatBalance
    override formatDomainName = formatDomainName
}
