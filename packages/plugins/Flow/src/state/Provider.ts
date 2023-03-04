import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/web3-state'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    chainResolver,
    type ChainId,
    isValidAddress,
    isValidChainId,
    getInvalidChainId,
    NetworkType,
    type ProviderType,
    type Web3,
    type Web3Provider,
    getDefaultChainId,
    getDefaultProviderType,
    getDefaultNetworkType,
} from '@masknet/web3-shared-flow'
import { Providers } from './Provider/provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context, Providers, {
            isSameAddress,
            isValidChainId,
            getInvalidChainId,
            isValidAddress,
            getDefaultChainId,
            getDefaultProviderType,
            getDefaultNetworkType,
            getNetworkTypeFromChainId: (chainId: ChainId) => chainResolver.networkType(chainId) ?? NetworkType.Flow,
        })
    }
}
