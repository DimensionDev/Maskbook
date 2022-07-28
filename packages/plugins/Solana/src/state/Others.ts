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
    ZERO_ADDRESS,
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    formatTokenId,
    explorerResolver,
} from '@masknet/web3-shared-solana'
import { getNativeTokenAddress } from '../utils'

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

    override formatAddress = formatAddress
    override formatDomainName = formatDomainName
    override formatTokenId = formatTokenId
    override explorerResolver = explorerResolver
    override getMaskTokenAddress = () => ''
    override getNativeTokenAddress = getNativeTokenAddress
}
