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
import { isSameAddress, Wallet as WalletItem } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, ProviderType, Transaction } from '@masknet/web3-shared-evm'

export class Wallet extends WalletState<ProviderType, Transaction> {
    private ref = new ValueRef<WalletItem[]>(EMPTY_LIST)
    private subscription = createSubscriptionFromValueRef(this.ref)

    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, [ProviderType.MaskWallet], subscriptions, {
            formatAddress: formatEthereumAddress,
        })

        if (this.subscriptions.providerType) {
            this.wallets = mapSubscription(
                mergeSubscription(this.subscriptions.providerType, this.storage.subscription, this.subscription),
                ([providerType, storage, wallets]) => {
                    return providerType === ProviderType.MaskWallet ? wallets : storage[providerType] ?? EMPTY_LIST
                },
            )
        }

        this.setupSubscriptions()
    }

    private setupSubscriptions() {
        const update = async () => {
            const wallets = this.context.wallets.getCurrentValue()
            const allPersonas = await Promise.all(
                this.context.allPersonas?.getCurrentValue()?.map(async (x) => {
                    // FIXME: @albert
                    // const { address } = await this.context.signWithPersona(
                    //     {
                    //         method: 'message',
                    //         identifier: x.identifier,
                    //         message: '',
                    //     },
                    //     true,
                    // )
                    return {
                        ...x,
                        address: '',
                    }
                }) ?? [],
            )
            // TODO: get wallets from storage
            if (this.providerType === ProviderType.MaskWallet) {
                const accounts = await SmartPayAccount.getAccountsByOwners(ChainId.Mumbai, [
                    ...wallets.map((x) => x.address),
                    ...allPersonas.map((x) => x.address),
                ])

                const now = new Date()
                const storage = this.storage.value.Maskbook

                this.ref.value = [
                    ...wallets,
                    ...accounts
                        .filter((x) => x.funded || x.deployed)
                        .map((x) => ({
                            id: x.address,
                            name: 'Smart Pay',
                            address: x.address,
                            hasDerivationPath: false,
                            hasStoredKeyInfo: false,
                            configurable: true,
                            createdAt: now,
                            updatedAt: now,
                            owner: x.owner,
                            identifier: allPersonas.find((persona) => isSameAddress(x.owner, persona.address))
                                ?.identifier,
                        })),
                ].map((x) => ({
                    ...x,
                    name: storage?.find((item) => isSameAddress(item.address, x.address))?.name ?? x.name,
                }))
            } else {
                this.ref.value = wallets
            }
        }

        update()
        this.context.wallets.subscribe(update)
        this.storage.subscription.subscribe(update)
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
            if (type === 'message') {
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
