import { clone, first } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { delay } from '@masknet/kit'
import {
    type Account,
    type ECKeyIdentifier,
    getSiteType,
    mapSubscription,
    mergeSubscription,
    type StorageObject,
} from '@masknet/shared-base'
import type { ProviderState as Web3ProviderState } from '@masknet/web3-shared-base'
import type { WalletAPI } from '../../../entry-types.js'

export interface ProviderStorage<Account, ProviderType extends string> {
    account: Account
    providerType: ProviderType
}

export abstract class ProviderState<ChainId extends number, ProviderType extends string, NetworkType extends string>
    implements Web3ProviderState<ChainId, ProviderType, NetworkType>
{
    protected site = getSiteType()

    public account?: Subscription<string>
    public chainId?: Subscription<ChainId>
    public networkType?: Subscription<NetworkType>
    public providerType?: Subscription<ProviderType>

    protected abstract providers: Record<ProviderType, WalletAPI.Provider<ChainId, ProviderType>>
    protected abstract isValidAddress(address: string | undefined): boolean
    protected abstract isValidChainId(chainID: number | undefined): boolean
    protected abstract isSameAddress(a: string | undefined, b: string | undefined): boolean
    protected abstract getInvalidChainId(): ChainId
    protected abstract getDefaultNetworkType(): NetworkType
    protected abstract getDefaultChainId(): ChainId
    protected abstract getDefaultProviderType(): ProviderType
    protected abstract getNetworkTypeFromChainId(chainId: ChainId): NetworkType
    constructor(
        public signWithPersona: WalletAPI.SignWithPersona,
        protected storage: StorageObject<ProviderStorage<Account<ChainId>, ProviderType>>,
    ) {}
    protected init() {
        this.setupSubscriptions()
        this.setupProviders()
    }

    protected setupSubscriptions() {
        if (!this.site) return

        this.chainId = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.chainId,
        )
        this.account = mapSubscription(
            mergeSubscription(this.storage.account.subscription),
            ([account]) => account.account,
        )
        this.networkType = mapSubscription(mergeSubscription(this.storage.account.subscription), ([account]) =>
            this.getNetworkTypeFromChainId(account.chainId),
        )
        this.providerType = mapSubscription(this.storage.providerType.subscription, (provider) => provider)
    }

    private setupProviders() {
        const providers = Object.entries(this.providers) as Array<
            [ProviderType, WalletAPI.Provider<ChainId, ProviderType>]
        >

        providers.map(async ([providerType, provider]) => {
            try {
                await provider.readyPromise
                if (!provider.ready) return
            } catch {
                return
            }

            provider.emitter.on('chainId', async (chainId) => {
                await this.setAccount(providerType, {
                    chainId: Number.parseInt(chainId, 16) as ChainId,
                })
            })
            provider.emitter.on('connect', async ({ account }) => {
                if (!this.isValidAddress(account)) return
                // provider should update before account, otherwise account failed to update
                await this.setProvider(providerType)
                await this.setAccount(providerType, {
                    account,
                })
            })
            provider.emitter.on('accounts', async (accounts) => {
                const account = first(accounts)

                if (account && this.isValidAddress(account))
                    await this.setAccount(providerType, {
                        account,
                    })
            })
            provider.emitter.on('disconnect', async () => {
                await this.setAccount(providerType, {
                    account: '',
                    chainId: this.getDefaultChainId(),
                })

                if (!this.site) return
                await this.storage.providerType.setValue(this.getDefaultProviderType())
            })

            try {
                await Promise.resolve(provider.setup?.())
            } catch {
                // ignore setup errors
            }
        })
    }

    private async setAccount(providerType: ProviderType, account: Partial<Account<ChainId>>) {
        if (this.storage.providerType.value !== providerType) return
        if (!this.site) return

        const account_ = this.storage.account.value
        const accountCopied = clone(account)

        if (accountCopied.account !== '' && !this.isValidAddress(accountCopied.account)) delete accountCopied.account
        if (accountCopied.chainId && !this.isValidChainId(accountCopied.chainId)) {
            accountCopied.chainId = this.getInvalidChainId()
        }

        const needToUpdateAccount =
            accountCopied.account === '' || !this.isSameAddress(account_.account, account.account)
        const needToUpdateChainId = accountCopied.chainId && account_.chainId !== accountCopied.chainId

        if (needToUpdateAccount || needToUpdateChainId) {
            await this.storage.account.setValue({
                ...account_,
                ...accountCopied,
            })
        }
    }

    private async setProvider(providerType: ProviderType) {
        if (!this.site) return

        if (this.storage.providerType.value !== providerType) {
            await this.storage.providerType.setValue(providerType)
        }
    }

    isReady(providerType: ProviderType) {
        return this.providers[providerType].ready
    }

    untilReady(providerType: ProviderType) {
        return this.providers[providerType].readyPromise
    }

    async connect(
        providerType: ProviderType,
        chainId: ChainId,
        address?: string,
        owner?: {
            account: string
            identifier?: ECKeyIdentifier
        },
        silent?: boolean,
    ) {
        const provider = this.providers[providerType]

        // compose the connection result
        const result = await provider.connect(chainId, address, owner, silent)

        // failed to connect provider
        if (!result.account) throw new Error('Failed to connect provider.')

        // switch the sub-network to the expected one
        if (chainId !== result.chainId) {
            await Promise.race([
                (async () => {
                    await delay(30 /* seconds */ * 1000 /* milliseconds */)
                    throw new Error(`Timeout of switching chain to ${chainId}.`)
                })(),
                provider.switchChain(chainId),
            ])
            result.chainId = chainId
        }

        // update local storage
        await this.setProvider(providerType)
        await this.setAccount(providerType, result)

        provider.emitter.emit('connect', result)
        return result
    }

    async disconnect(providerType: ProviderType) {
        const provider = this.providers[providerType]
        await provider.disconnect()

        // update local storage
        await this.setAccount(providerType, {
            account: '',
        })

        provider.emitter.emit('disconnect', providerType)
    }
}
