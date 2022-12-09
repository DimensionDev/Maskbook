import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/web3-state'
import { mapSubscription, mergeSubscription } from '@masknet/shared-base'
import { Account, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    Web3,
    Web3Provider,
    chainResolver,
    isValidChainId,
    getInvalidChainId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import { Providers } from './Connection/provider.js'

export class Provider extends ProviderState<ChainId, ProviderType, NetworkType, Web3Provider, Web3> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, Providers, {
            isSameAddress,
            isValidAddress,
            isValidChainId,
            getDefaultChainId,
            getInvalidChainId,
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
        this.account = mapSubscription(mergeSubscription(this.storage.account.subscription), ([account]) => {
            return account.account
        })
        this.networkType = mapSubscription(
            mergeSubscription(this.providerType, this.storage.account.subscription, this.context.chainId),
            ([providerType, account, chainId]) => {
                if (providerType === ProviderType.MaskWallet) return this.options.getNetworkTypeFromChainId(chainId)
                return this.options.getNetworkTypeFromChainId(account.chainId)
            },
        )
    }

    override async connect(
        chainId: ChainId,
        providerType: ProviderType,
        address?: string | undefined,
    ): Promise<Account<ChainId>> {
        // Disconnect WalletConnect, prevents its session lasting too long.
        if (this.providers[ProviderType.WalletConnect].connected) {
            try {
                await super.disconnect(ProviderType.WalletConnect)
            } catch {
                // do nothing
            }
        }

        return super.connect(chainId, providerType, address)
    }
}
