import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST, mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import { isSameAddress, Wallet, WalletState as Web3WalletState } from '@masknet/web3-shared-base'

export type WalletStorage<ProviderType extends string> = Record<ProviderType, Wallet[]>

export class WalletState<ChainId, ProviderType extends string, Transaction> implements Web3WalletState<Transaction> {
    public wallets?: Subscription<Wallet[]>

    protected storage: StorageItem<WalletStorage<ProviderType>> = null!

    protected get all() {
        return this.wallets?.getCurrentValue() ?? EMPTY_LIST
    }

    protected get chainId() {
        return this.subscriptions.chainId?.getCurrentValue() ?? this.options.getDefaultChainId()
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
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
        protected options: {
            getDefaultChainId: () => ChainId
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
    }

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
    signMessage(address: string, type: string, message: string, password?: string | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
