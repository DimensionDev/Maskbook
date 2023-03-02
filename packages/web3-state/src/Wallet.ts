import { omit, uniqWith } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST, mapSubscription, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import { isSameAddress, type Wallet, type WalletState as Web3WalletState } from '@masknet/web3-shared-base'

type WalletStorage<ProviderType extends string> = Partial<Record<ProviderType, Wallet[]>>

export class WalletState<ProviderType extends string, Transaction> implements Web3WalletState<Transaction> {
    public storage: StorageItem<WalletStorage<ProviderType>> = null!
    public wallets?: Subscription<Wallet[]>

    protected get all() {
        return this.wallets?.getCurrentValue() ?? EMPTY_LIST
    }

    protected get providerType() {
        const providerType = this.subscriptions.providerType?.getCurrentValue()
        if (!providerType) throw new Error('Please connect a wallet.')
        if (!this.providers.includes(providerType)) throw new Error(`Not supported provider typ: ${providerType}.`)
        return providerType
    }

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected providers: ProviderType[],
        protected subscriptions: {
            providerType?: Subscription<ProviderType>
        },
        protected options: {
            formatAddress: (address: string) => string
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Wallet', {
            value: Object.fromEntries(
                this.providers.map((x) => [x, []] as [string, Wallet[]]),
            ) as WalletStorage<ProviderType>,
        })
        this.storage = storage.value

        if (this.subscriptions.providerType) {
            this.wallets = mapSubscription(
                mergeSubscription(this.subscriptions.providerType, this.storage.subscription),
                ([providerType, storage]) => storage[providerType] ?? EMPTY_LIST,
            )
        }
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    setup() {}

    async addWallet(wallet: Wallet) {
        const now = new Date()
        const address = this.options.formatAddress(wallet.address)

        // already added
        if (this.all.some((x) => isSameAddress(x.address, address))) return

        await this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: [
                ...this.all,
                {
                    ...wallet,
                    id: address,
                    address,
                    name: wallet.name.trim() || `Account ${this.all.length + 1}`,
                    createdAt: now,
                    updatedAt: now,
                },
            ],
        })
    }

    async updateWallet(
        address: string,
        updates: Partial<Omit<Wallet, 'id' | 'address' | 'createdAt' | 'updatedAt' | 'storedKeyInfo'>>,
    ) {
        const wallet = this.all.find((x) => isSameAddress(x.address, address))
        if (!wallet) throw new Error('Failed to find wallet.')

        const now = new Date()
        await this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: this.all.map((x) =>
                isSameAddress(x.address, address)
                    ? {
                          ...x,
                          ...omit(updates, ['id', 'address', 'createdAt', 'updatedAt', 'storedKeyInfo']),
                          createdAt: x.createdAt ?? now,
                          updatedAt: now,
                      }
                    : x,
            ),
        })
    }

    async updateOrAddWallet(wallet: Wallet) {
        const target = this.all.find((x) => isSameAddress(x.address, wallet.address))
        if (target) {
            return this.updateWallet(
                target.address,
                omit(wallet, ['id', 'address', 'createdAt', 'updatedAt', 'storedKeyInfo']),
            )
        }
        this.addWallet(wallet)
    }

    async updateWallets(wallets: Wallet[]) {
        if (!wallets.length) return
        await this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: uniqWith([...this.all, ...wallets], (a, b) => isSameAddress(a.address, b.address)),
        })
    }

    async renameWallet(address: string, name: string) {
        await this.updateWallet(address, {
            name,
        })
    }

    async removeWallet(address: string, password?: string | undefined) {
        await this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: this.all.filter((x) => !isSameAddress(x.address, address)),
        })
    }

    signTransaction(address: string, transaction: Transaction): Promise<string> {
        throw new Error('Method not implemented.')
    }

    signMessage(type: string, address: string, message: string, password?: string | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
