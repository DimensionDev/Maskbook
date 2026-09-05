import { first, isEqual, uniqWith } from 'lodash-es'
import { createSubscriptionFromValueRef, EMPTY_LIST, ImportSource, ValueRef, type Wallet } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, isValidAddress, PayloadEditor, ProviderType, type RequestArguments } from '@masknet/web3-shared-evm'
import { EVMRequestReadonly } from '../apis/RequestReadonlyAPI.js'
import { BaseHostedProvider, type BaseHostedStorage } from './BaseHosted.js'
import { FireflyEmbeddedWalletClient } from '../../../Firefly/EmbeddedWalletClient.js'

export let FireflyEmbeddedWalletProviderInstance: FireflyEmbeddedWalletProvider
export function setFireflyEmbeddedWalletProviderInstance(provider: FireflyEmbeddedWalletProvider) {
    FireflyEmbeddedWalletProviderInstance = provider
}

/**
 * Hosts Firefly embedded wallets (provisioned via Firefly/X login) under their
 * own ProviderType, backed entirely by the Firefly REST API — no local key
 * material, password, or lock state involved.
 */
export class FireflyEmbeddedWalletProvider extends BaseHostedProvider {
    private ref = new ValueRef<Wallet[]>(EMPTY_LIST)
    private walletsSubscription = createSubscriptionFromValueRef(this.ref)

    // Never invoked by the base class; kept only to satisfy the abstract contract.
    protected override async io_renameWallet(): Promise<void> {}

    constructor(walletStorage: BaseHostedStorage) {
        super(ProviderType.Firefly, walletStorage)
    }

    private async update() {
        const now = new Date()
        const embeddedWallets = await FireflyEmbeddedWalletClient.getEmbeddedWallets().catch(() => [])
        const formattedWallets: Wallet[] = embeddedWallets.map((wallet) => ({
            id: wallet.address,
            name: this.walletStorage.wallets.value.find((x) => isSameAddress(x.address, wallet.address))?.name || '',
            source: ImportSource.Privy,
            address: wallet.address,
            createdAt: new Date(wallet.first_verified_at),
            updatedAt: now,
        }))

        const result = uniqWith(formattedWallets, (a, b) => isSameAddress(a.address, b.address))

        if (!isEqual(result, super.wallets)) {
            await this.updateWallets(result)
        }
        this.ref.value = result
    }

    override get subscription() {
        return {
            ...super.subscription,
            wallets: this.walletsSubscription,
        }
    }

    override get wallets() {
        return this.subscription.wallets.getCurrentValue()
    }

    override async setup() {
        super.setup()

        this.subscription.wallets.subscribe(async () => {
            const primaryWallet = first(this.wallets)
            if (!this.hostedAccount && primaryWallet) {
                await this.switchAccount(primaryWallet.address)
                await this.switchChain(ChainId.Mainnet)
            }
        })

        await this.update()
    }

    // Embedded wallets have no local secret to remove; the equivalent action is signing out of Firefly.
    override async removeWallet(): Promise<void> {}
    override async removeWallets(): Promise<void> {}
    async resetAllWallets(): Promise<void> {}

    override async connect(chainId: ChainId, address?: string) {
        // refresh the wallet list from the Firefly backend before resolving the connection.
        await this.update()

        if (isValidAddress(address)) {
            await this.switchAccount(address)
            await this.switchChain(chainId)
            return { account: address, chainId }
        }

        const primaryWallet = first(this.wallets)
        if (primaryWallet && !isSameAddress(this.hostedAccount, primaryWallet.address)) {
            await this.switchAccount(primaryWallet.address)
        }
        if (chainId !== this.hostedChainId) await this.switchChain(chainId)

        return {
            account: this.hostedAccount,
            chainId: this.hostedChainId,
        }
    }

    override async disconnect() {
        await this.walletStorage.account.setValue('')
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        return EVMRequestReadonly.request<T>(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill() as RequestArguments,
        )
    }
}
