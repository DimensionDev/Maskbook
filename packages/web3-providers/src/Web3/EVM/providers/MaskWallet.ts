import { debounce, first, isEqual, uniqWith } from 'lodash-es'
import {
    createSubscriptionFromValueRef,
    CrossIsolationMessages,
    type Wallet,
    EMPTY_LIST,
    ExtensionSite,
    ValueRef,
    ImportSource,
    getExtensionSiteType,
} from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, isValidAddress, PayloadEditor, ProviderType, type RequestArguments } from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../apis/ResolverAPI.js'
import { EVMRequestReadonly } from '../apis/RequestReadonlyAPI.js'
import type { WalletAPI } from '../../../entry-types.js'
import { BaseHostedProvider, type BaseHostedStorage } from './BaseHosted.js'
import { Privy } from '@masknet/web3-providers'

export let MaskWalletProviderInstance: MaskWalletProvider
export function setMaskWalletProviderInstance(mask: MaskWalletProvider) {
    MaskWalletProviderInstance = mask
}
export class MaskWalletProvider extends BaseHostedProvider {
    private ref = new ValueRef<Wallet[]>(EMPTY_LIST)
    private walletsSubscription = createSubscriptionFromValueRef(this.ref)
    protected override async io_renameWallet(address: string, name: string): Promise<void> {
        await this.context.renameWallet(address, name)
    }
    constructor(
        private context: WalletAPI.MaskWalletIOContext,
        walletStorage: BaseHostedStorage,
    ) {
        super(ProviderType.MaskWallet, walletStorage)
    }

    private async updateImmediately() {
        const wallets = this.context.wallets.getCurrentValue()

        // update local wallets immediately
        this.ref.value = uniqWith([...super.wallets, ...wallets], (a, b) => isSameAddress(a.address, b.address))
    }

    private async update() {
        // Fetching info of SmartPay wallets is slow, update provider wallets eagerly here.
        await this.updateImmediately()

        const wallets = this.context.wallets.getCurrentValue()

        const now = new Date()

        const privyWallets = await Privy.getEvmWallets()
        const formattedPrivyWallets: Wallet[] = privyWallets.map((wallet) => ({
            id: wallet.address,
            name: 'Privy Wallet',
            source: ImportSource.Privy,
            address: wallet.address,
            configurable: false,
            createdAt: new Date(wallet.first_verified_at as number),
            updatedAt: now,
            hasStoredKeyInfo: false,
            hasDerivationPath: false,
        }))

        const result = uniqWith([...formattedPrivyWallets, ...super.wallets, ...wallets], (a, b) =>
            isSameAddress(a.address, b.address),
        )

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

        await this.updateImmediately()

        const debounceUpdate = debounce(this.update.bind(this), 1000)

        this.context.wallets.subscribe(debounceUpdate)
        this.context.allPersonas.subscribe(debounceUpdate)
        CrossIsolationMessages.events.renameWallet.on(debounceUpdate)
    }

    override async addWallet(wallet: Wallet): Promise<void> {
        if (!this.hostedAccount && !this.wallets.length) await this.walletStorage?.account.setValue(wallet.address)
        await this.context.addWallet(ImportSource.WalletRPC, wallet.address, wallet)
    }

    override async removeWallet(address: string, password?: string | undefined): Promise<void> {
        if (isSameAddress(this.hostedAccount, address)) await this.walletStorage?.account.setValue('')
        await super.removeWallet(address, password)
        await this.context.removeWallet(address, password)
    }

    override async removeWallets(wallets: Wallet[]): Promise<void> {
        await super.removeWallets(wallets)
        for (const wallet of wallets) {
            if (isSameAddress(this.hostedAccount, wallet.address)) await this.walletStorage?.account.setValue('')
            await this.context.removeWallet(wallet.address)
        }
    }

    async resetAllWallets(): Promise<void> {
        await super.removeWallets(this.wallets)
        await this.walletStorage?.account.setValue('')
        await this.context.resetAllWallets()
    }

    override async renameWallet(address: string, name: string) {
        await super.renameWallet(address, name)
        CrossIsolationMessages.events.renameWallet.sendToAll({})
    }

    override async connect(
        chainId: ChainId,
        address?: string,

        silent?: boolean,
    ) {
        if (getExtensionSiteType() === ExtensionSite.Popup || silent) {
            if (isValidAddress(address)) {
                await this.switchAccount(address)
                await this.switchChain(chainId)

                return {
                    account: address,
                    chainId,
                }
            }

            return {
                account: this.hostedAccount,
                chainId: this.hostedChainId,
            }
        }

        const account = first(await this.context.selectMaskWalletAccount(chainId, address, location.origin))
        if (!account) throw new Error(`Failed to connect to ${EVMChainResolver.chainFullName(chainId)}`)

        // switch account
        if (!isSameAddress(this.hostedAccount, account?.address)) {
            await this.switchAccount(account.address)
        }

        // switch chain
        if (chainId !== this.hostedChainId) await this.switchChain(chainId)
        return {
            chainId,
            account: account.address,
        }
    }

    override async disconnect() {
        await this.context.disconnectAllWalletsFromOrigin(location.origin, 'any')
    }

    override async request<T>(
        requestArguments: RequestArguments,
        initial?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        return EVMRequestReadonly.request<T>(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill() as RequestArguments,
            initial,
        )
    }
}
