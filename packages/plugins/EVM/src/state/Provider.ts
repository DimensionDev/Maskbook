import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState } from '@masknet/web3-state'
import { type ECKeyIdentifier, mapSubscription, mergeSubscription } from '@masknet/shared-base'
import { type Account, isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    isValidAddress,
    NetworkType,
    ProviderType,
    type Web3,
    type Web3Provider,
    chainResolver,
    isValidChainId,
    getInvalidChainId,
    getDefaultChainId,
    getDefaultNetworkType,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import { Providers } from './Provider/provider.js'

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

    protected override async setupSubscriptions() {
        this.providerType = mapSubscription(this.storage.providerType.subscription, (provider) => provider)

        this.chainId = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.chainId,
        )
        this.account = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.account,
        )
        this.networkType = mapSubscription(mergeSubscription(this.storage.account.subscription), ([account]) => {
            return this.options.getNetworkTypeFromChainId(account.chainId)
        })
    }

    override async connect(
        providerType: ProviderType,
        chainId: ChainId,
        address?: string | undefined,
        owner?: {
            account: string
            identifier?: ECKeyIdentifier
        },
        silent?: boolean,
    ): Promise<Account<ChainId>> {
        // Disconnect WalletConnect, prevents its session lasting too long.
        if (providerType !== ProviderType.WalletConnect && this.providers[ProviderType.WalletConnect].connected) {
            try {
                await super.disconnect(ProviderType.WalletConnect)
            } catch {
                // do nothing
            }
        }

        return super.connect(providerType, chainId, address, owner, silent)
    }
}
