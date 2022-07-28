import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    chainResolver,
    ChainId,
    isValidAddress,
    isValidChainId,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
} from '@masknet/web3-shared-flow'
import { Providers } from './Connection/provider'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context, Providers, {
            isSameAddress,
            isValidChainId,
            isValidAddress,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultProviderType: () => ProviderType.None,
            getDefaultNetworkType: () => NetworkType.Flow,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Flow,
        })
    }
}
