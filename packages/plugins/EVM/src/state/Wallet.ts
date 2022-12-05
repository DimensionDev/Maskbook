import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import {
    EMPTY_LIST,
    mapSubscription,
    mergeSubscription,
    ValueRef,
    createSubscriptionFromValueRef,
} from '@masknet/shared-base'
import { SmartPayAccount } from '@masknet/web3-providers'
import type { Wallet as WalletItem } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, getDefaultChainId, ProviderType, Transaction } from '@masknet/web3-shared-evm'

export class Wallet extends WalletState<ChainId, ProviderType, Transaction> {
    private ref = new ValueRef<WalletItem[]>(EMPTY_LIST)
    private subscription = createSubscriptionFromValueRef(this.ref)

    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
            account?: Subscription<string>
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, [ProviderType.MaskWallet], subscriptions, {
            getDefaultChainId,
            formatAddress: formatEthereumAddress,
        })

        if (this.subscriptions.providerType) {
            this.wallets = mapSubscription(
                mergeSubscription(this.subscriptions.providerType, this.storage.subscription, this.subscription),
                ([providerType, storage, wallets]) => {
                    if (providerType === ProviderType.MaskWallet) {
                        return wallets
                    }
                    return storage[providerType] ?? EMPTY_LIST
                },
            )
        }

        this.setupSubscriptions()
    }

    private setupSubscriptions() {
        this.context.wallets.subscribe(async () => {
            const wallets = this.context.wallets.getCurrentValue()

            if (this.providerType === ProviderType.MaskWallet && this.chainId === ChainId.Matic) {
                const now = new Date()
                const accounts = await SmartPayAccount.getAccounts(
                    this.chainId,
                    wallets.map((x) => x.address),
                )
                this.ref.value = [
                    ...wallets,
                    ...accounts.map((x) => ({
                        id: x.address,
                        name: 'Smart Pay',
                        address: x.address,
                        hasDerivationPath: false,
                        hasStoredKeyInfo: false,
                        configurable: true,
                        createdAt: now,
                        updatedAt: now,
                        owner: x.owner,
                    })),
                ]
            } else {
                this.ref.value = wallets
            }
        })
    }

    override async addWallet(wallet: WalletItem): Promise<void> {
        if (this.providerType === ProviderType.MaskWallet) {
            await this.context.addWallet(wallet.address, wallet)
        } else {
            await super.addWallet(wallet)
        }
    }

    override async removeWallet(address: string, password?: string | undefined): Promise<void> {
        if (this.providerType === ProviderType.MaskWallet) {
            await this.context.removeWallet(address, password)
        } else {
            await super.removeWallet(address, password)
        }
    }

    override signTransaction(address: string, transaction: Transaction): Promise<string> {
        if (this.providerType === ProviderType.MaskWallet) {
            return this.context.signTransaction(address, transaction)
        } else {
            return super.signTransaction(address, transaction)
        }
    }

    override signMessage(
        address: string,
        type: string,
        message: string,
        password?: string | undefined,
    ): Promise<string> {
        if (this.providerType === ProviderType.MaskWallet) {
            if (type === 'personal') {
                return this.context.signPersonalMessage(address, message)
            } else if (type === 'typedData') {
                return this.context.signTypedData(address, message)
            }
            throw new Error('Unknown sign type.')
        } else {
            return super.signMessage(address, type, message, password)
        }
    }
}
