import type { Subscription } from 'use-subscription'
import {
    EnhanceableSite,
    ExtensionSite,
    getSiteType,
    mapSubscription,
    mergeSubscription,
    StorageObject,
} from '@masknet/shared-base'
import type { Plugin } from '../types'
import type { Web3Plugin } from '../web3-types'

export interface ProviderStorage<Account, ProviderType extends string> {
    /** Providers map to account settings. */
    accounts: Record<ProviderType, Account>
    /** Sites map to provider type. */
    providers: Record<EnhanceableSite | ExtensionSite, ProviderType>
}

export class ProviderState<ChainId extends number, NetworkType extends string, ProviderType extends string>
    implements Web3Plugin.ObjectCapabilities.ProviderState<ChainId, NetworkType, ProviderType>
{
    protected site = getSiteType()
    protected storage: StorageObject<ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType>> = null!

    public account?: Subscription<string>
    public chainId?: Subscription<ChainId>
    public networkType?: Subscription<NetworkType>
    public providerType?: Subscription<ProviderType>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType>,
        protected options: {
            isSameAddress(a?: string, b?: string): boolean
            getNetworkTypeFromChainId(chainId: ChainId): NetworkType
        },
    ) {
        const { storage } = this.context.createKVStorage('memory', defaultValue)
        this.storage = storage

        const site = this.site
        if (!site) return

        this.providerType = mapSubscription(this.storage.providers.subscription, (providers) => providers[site])

        this.chainId = mapSubscription(
            mergeSubscription<[ProviderType, Record<ProviderType, Web3Plugin.Account<ChainId>>]>(
                this.providerType,
                this.storage.accounts.subscription,
            ),
            ([providerType, accounts]) => accounts[providerType].chainId,
        )
        this.account = mapSubscription(
            mergeSubscription<[ProviderType, Record<ProviderType, Web3Plugin.Account<ChainId>>]>(
                this.providerType,
                this.storage.accounts.subscription,
            ),
            ([providerType, accounts]) => accounts[providerType].account,
        )
        this.networkType = mapSubscription(
            mergeSubscription<[ProviderType, Record<ProviderType, Web3Plugin.Account<ChainId>>]>(
                this.providerType,
                this.storage.accounts.subscription,
            ),
            ([providerType, accounts]) => this.options.getNetworkTypeFromChainId(accounts[providerType].chainId),
        )
    }

    async setAccount(providerType: ProviderType, account: string) {
        const account_ = this.storage.accounts.value[providerType]
        if (this.options.isSameAddress(account_.account, account)) return
        await this.storage.accounts.setValue({
            ...this.storage.accounts.value,
            [providerType]: {
                ...account_,
                account,
            },
        })
    }

    async setChainId(providerType: ProviderType, chainId: ChainId) {
        const account = this.storage.accounts.value[providerType]
        if (account.chainId === chainId) return
        await this.storage.accounts.setValue({
            ...this.storage.accounts.value,
            [providerType]: {
                ...account,
                chainId,
            },
        })
    }
}
