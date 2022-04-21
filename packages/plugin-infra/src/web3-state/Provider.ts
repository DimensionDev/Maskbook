import { first } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import { delay } from '@dimensiondev/kit'
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

export class ProviderState<
    ChainId extends number,
    NetworkType extends string,
    ProviderType extends string,
    Web3Provider,
    Web3,
> implements Web3Plugin.ObjectCapabilities.ProviderState<ChainId, NetworkType, ProviderType>
{
    protected site = getSiteType()
    protected storage: StorageObject<ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType>> = null!

    public account?: Subscription<string>
    public chainId?: Subscription<ChainId>
    public networkType?: Subscription<NetworkType>
    public providerType?: Subscription<ProviderType>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected providers: Record<ProviderType, Web3Plugin.Provider<ChainId, Web3Provider, Web3>>,
        protected defaultValue: ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType>,
        protected options: {
            isValidAddress(a?: string): boolean
            isSameAddress(a?: string, b?: string): boolean
            getDefaultChainId(): ChainId
            getNetworkTypeFromChainId(chainId: ChainId): NetworkType
        },
    ) {
        const { storage } = this.context.createKVStorage('memory', defaultValue)
        this.storage = storage

        this.setupSubscriptions()
        this.setupProviders()
    }

    private setupSubscriptions() {
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

    private setupProviders() {
        Object.entries(this.providers).forEach((entry) => {
            const [providerType, provider] = entry as [ProviderType, Web3Plugin.Provider<ChainId, Web3Provider, Web3>]

            provider.emitter.on('chainId', async (chainId) => {
                await this.setChainId(providerType, Number.parseInt(chainId, 16) as ChainId)
            })

            provider.emitter.on('accounts', async (accounts) => {
                const account = first(accounts)
                if (account && this.options.isValidAddress(account)) await this.setAccount(providerType, account)
            })

            provider.emitter.on('discconect', async () => {
                await this.setAccount(providerType, '')
                await this.setChainId(providerType, this.options.getDefaultChainId())
            })
        })
    }

    private async setAccount(providerType: ProviderType, account: string) {
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

    private async setChainId(providerType: ProviderType, chainId: ChainId) {
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

    async connect(chainId: ChainId, providerType: ProviderType) {
        const provider = this.providers[providerType]

        // compose the connection result
        const account = await provider.connect(chainId)

        // failed to connect provider
        if (!account.account) throw new Error('Failed to connect provider.')

        // switch the sub-network to the expected one
        if (chainId !== account.chainId) {
            await Promise.race([
                (async () => {
                    await delay(30 /* seconds */ * 1000 /* milliseconds */)
                    throw new Error('Timeout!')
                })(),
                provider.switchChain(chainId),
            ])
        }

        provider.emitter.emit('connect', account)
        return account
    }

    async disconect(providerType: ProviderType) {
        const provider = this.providers[providerType]
        await provider.disconnect()
    }
}
