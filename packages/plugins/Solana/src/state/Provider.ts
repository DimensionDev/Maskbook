import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderState } from '@masknet/plugin-infra/web3'
import {
    isValidChainId,
    isValidAddress,
    chainResolver,
    ChainId,
    NetworkType,
    ProviderType,
    Web3Provider,
    Web3,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-solana'
import { Providers } from './Connection/provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context, Providers, {
            isSameAddress,
            isValidChainId,
            isValidAddress,
            getDefaultChainId,
            getDefaultNetworkType,
            getDefaultProviderType,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Solana,
        })
    }
}
