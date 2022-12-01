import { omit, uniqBy } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST, mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import { isSameAddress, Wallet, WalletState as Web3WalletState } from '@masknet/web3-shared-base'

export type WalletStorage<ProviderType extends string> = Record<ProviderType, Wallet[]>

export class WalletState<ProviderType extends string, Transaction> implements Web3WalletState<Transaction> {
    public wallets?: Subscription<Wallet[]>
    public walletPrimary?: Subscription<Wallet | null>

    private get providerType() {
        const providerType = this.subscriptions.providerType?.getCurrentValue()
        if (!providerType) throw new Error('Please connect a wallet.')
        return providerType
    }

    private get all() {
        return this.wallets?.getCurrentValue() ?? EMPTY_LIST
    }

    protected storage: StorageItem<WalletStorage<ProviderType>> = null!

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected providers: ProviderType[],
        protected subscriptions: {
            account?: Subscription<string>
            providerType?: Subscription<ProviderType>
        },
        protected options: {
            formatAddress: (address: string) => string
        },
    ) {
        const defaultValue = Object.fromEntries(
            this.providers.map((x) => [x, []] as [string, Wallet[]]),
        ) as WalletStorage<ProviderType>
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Wallet', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.providerType) {
            this.wallets = mapSubscription(
                mergeSubscription(this.subscriptions.providerType, this.storage.subscription),
                ([providerType, storage]) => storage[providerType],
            )
        }
        if (this.subscriptions.account && this.subscriptions.providerType) {
            this.walletPrimary = mapSubscription(
                mergeSubscription(
                    this.subscriptions.account,
                    this.subscriptions.providerType,
                    this.storage.subscription,
                ),
                ([account, providerType, storage]) =>
                    storage[providerType].find((x) => isSameAddress(account, x.address)) ?? null,
            )
        }
    }

    addWallet(wallet: Wallet) {
        const now = new Date()
        const address = this.options.formatAddress(wallet.address)

        this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: uniqBy(
                [
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
                (x) => x.address.toLowerCase(),
            ),
        })
    }
    updateWallet(
        address: string,
        updates: Partial<Omit<Wallet, 'id' | 'address' | 'createdAt' | 'updatedAt' | 'storedKeyInfo'>>,
    ) {
        const wallet = this.all.find((x) => isSameAddress(x.address, address))
        if (!wallet) throw new Error('Failed to find wallet.')

        const now = new Date()
        this.storage.setValue({
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
    renameWallet(address: string, name: string) {
        this.updateWallet(address, {
            name,
        })
    }
    removeWallet(address: string, password?: string | undefined) {
        this.storage.setValue({
            ...this.storage.value,
            [this.providerType]: this.all.filter((x) => !isSameAddress(x.address, address)),
        })
    }

    signTransaction(address: string, transaction: Transaction): Promise<string> {
        throw new Error('Method not implemented.')
    }
    signMessage(address: string, type: string, message: string, password?: string | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
