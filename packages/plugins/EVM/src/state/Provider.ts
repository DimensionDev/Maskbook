import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
    chainResolver,
    isValidChainId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import { Providers } from './Connection/provider.js'
import { mapSubscription, mergeSubscription } from '@masknet/shared-base'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, Providers, {
            isSameAddress,
            isValidAddress,
            isValidChainId,
            getDefaultChainId,
            getDefaultNetworkType,
            getDefaultProviderType,
            getNetworkTypeFromChainId: (chainId: ChainId) => chainResolver.networkType(chainId) ?? NetworkType.Ethereum,
        })
    }

    override setupSubscriptions() {
        this.providerType = mapSubscription(this.storage.providerType.subscription, (provider) => provider)

        this.chainId = mapSubscription(
            mergeSubscription(this.providerType, this.storage.account.subscription, this.context.chainId),
            ([providerType, account, chainId]) => {
                if (providerType === ProviderType.MaskWallet) return chainId
                return account.chainId
            },
        )
        this.account = mapSubscription(
            mergeSubscription(this.providerType, this.storage.account.subscription, this.context.account),
            ([providerType, account, maskAccount]) => {
                if (providerType === ProviderType.MaskWallet) return maskAccount

                return account.account
            },
        )
        this.networkType = mapSubscription(
            mergeSubscription(this.providerType, this.storage.account.subscription, this.context.chainId),
            ([providerType, account, chainId]) => {
                if (providerType === ProviderType.MaskWallet) return this.options.getNetworkTypeFromChainId(chainId)

                return this.options.getNetworkTypeFromChainId(account.chainId)
            },
        )
    }
}
