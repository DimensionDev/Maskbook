import { compact, uniqWith } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'
import {
    EMPTY_LIST,
    mapSubscription,
    mergeSubscription,
    ValueRef,
    createSubscriptionFromValueRef,
    SignType,
    CrossIsolationMessages,
} from '@masknet/shared-base'
import { SmartPayOwner, SmartPayBundler } from '@masknet/web3-providers'
import { isSameAddress, type Wallet as WalletItem } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ProviderType, type Transaction } from '@masknet/web3-shared-evm'

export class Wallet extends WalletState<ProviderType, Transaction> {
    private ref = new ValueRef(this.context.wallets.getCurrentValue())
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
    }

    override setup() {
        const update = async () => {
            if (this.providerType !== ProviderType.MaskWallet) return

            const wallets = this.context.wallets.getCurrentValue()

            const localWallets = this.storage.initialized ? this.storage.value[ProviderType.MaskWallet] : []

            this.ref.value = uniqWith([...wallets, ...(localWallets ?? [])], (a, b) =>
                isSameAddress(a.address, b.address),
            )

            const allPersonas = this.context.allPersonas?.getCurrentValue() ?? []
            const chainId = await SmartPayBundler.getSupportedChainId()
            const accounts = await SmartPayOwner.getAccountsByOwners(chainId, [
                ...wallets.map((x) => x.address),
                ...compact(allPersonas.map((x) => x.address)),
            ])

            const now = new Date()

            const smartPayWallets = accounts
                .filter((x) => x.deployed)
                .map((x) => ({
                    id: x.address,
                    name: localWallets?.find((item) => isSameAddress(item.address, x.address))?.name ?? 'Smart Pay',
                    address: x.address,
                    hasDerivationPath: false,
                    hasStoredKeyInfo: false,
                    configurable: true,
                    createdAt: now,
                    updatedAt: now,
                    owner: x.owner,
                    deployed: x.deployed,
                    identifier: allPersonas.find((persona) => isSameAddress(x.owner, persona.address))?.identifier,
                }))

            const result = uniqWith([...wallets, ...(localWallets ?? []), ...smartPayWallets], (a, b) =>
                isSameAddress(a.address, b.address),
            )

            await this.updateWallets(result)
            this.ref.value = result
        }

        update()
        this.context.wallets.subscribe(update)
        this.context.allPersonas?.subscribe(update)
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
            CrossIsolationMessages.events.ownerDeletionEvent.sendToAll({ owner: address })
        } else {
            await super.removeWallet(address, password)
        }
    }

    override signTransaction(address: string, transaction: Transaction): Promise<string> {
        if (this.providerType === ProviderType.MaskWallet) {
            return this.context.signWithWallet(SignType.Transaction, transaction, address)
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
                return this.context.signWithWallet(SignType.Message, address, message)
            } else if (type === 'typedData') {
                return this.context.signWithWallet(SignType.TypedData, address, message)
            }
            throw new Error('Unknown sign type.')
        } else {
            return super.signMessage(type, address, message, password)
        }
    }
}
