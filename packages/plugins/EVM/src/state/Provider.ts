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
} from '@masknet/web3-shared-evm'
import { Providers } from './Connection/provider'
import { ExtensionSite, mapSubscription, mergeSubscription } from '@masknet/shared-base'
import { getEnumAsArray } from '@dimensiondev/kit'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, Providers, {
            isSameAddress,
            isValidAddress,
            isValidChainId,
            getDefaultChainId: () => ChainId.Mainnet,
            getDefaultNetworkType: () => NetworkType.Ethereum,
            getDefaultProviderType: (site) =>
                getEnumAsArray(ExtensionSite).some(({ value }) => value === site)
                    ? ProviderType.MaskWallet
                    : ProviderType.None,
            getNetworkTypeFromChainId: (chainId: ChainId) =>
                chainResolver.chainNetworkType(chainId) ?? NetworkType.Ethereum,
        })
    }

    override setupSubscriptions() {
        const site = this.site
        if (!site) return

        this.providerType = mapSubscription(this.storage.providers.subscription, (providers) => providers[site])

        this.chainId = mapSubscription(
            mergeSubscription(this.providerType, this.storage.accounts.subscription, this.context.chainId),
            ([providerType, accounts, chainId]) => {
                if (providerType === ProviderType.MaskWallet) return chainId
                return accounts[providerType].chainId
            },
        )
        this.account = mapSubscription(
            mergeSubscription(this.providerType, this.storage.accounts.subscription, this.context.account),
            ([providerType, accounts, maskAccount]) => {
                if (providerType === ProviderType.MaskWallet) return maskAccount

                return accounts[providerType].account
            },
        )
        this.networkType = mapSubscription(
            mergeSubscription(this.providerType, this.storage.accounts.subscription, this.context.chainId),
            ([providerType, accounts, chainId]) => {
                if (providerType === ProviderType.MaskWallet) return this.options.getNetworkTypeFromChainId(chainId)

                return this.options.getNetworkTypeFromChainId(accounts[providerType].chainId)
            },
        )
    }
}
