import { omit, uniqWith } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import { toHex } from 'web3-utils'
import { delay } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import { EMPTY_LIST, type StorageObject, type Wallet } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    type ChainId,
    getDefaultChainId,
    isValidAddress,
    formatEthereumAddress,
    PayloadEditor,
    type ProviderType,
    type Web3Provider,
    type Web3,
} from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import { ConnectionAPI } from '../apis/ConnectionAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

export class BaseHostedProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private Web3 = new ConnectionAPI()

    private walletStorage:
        | StorageObject<{
              account: string
              chainId: ChainId
              wallets: Wallet[]
          }>
        | undefined

    constructor(
        protected override providerType: ProviderType,
        protected initial?: {
            formatAddress?: () => string
            isSupportedAccount?: (account: string) => Promise<boolean>
            isSupportedChainId?: (chainId: ChainId) => Promise<boolean>
            getDefaultAccount?: () => string
            getDefaultChainId?: () => ChainId
        },
    ) {
        super(providerType)
    }

    override async setup(context?: Plugin.SNSAdaptor.SNSAdaptorContext) {
        await super.setup(context)
        this.walletStorage = context?.createKVStorage('memory', {}).createSubScope(`${this.providerType}_hosted`, {
            account: this.options.getDefaultAccount(),
            chainId: this.options.getDefaultChainId(),
            wallets: [] as Wallet[],
        }).storage

        await this.walletStorage?.account.initializedPromise
        await this.walletStorage?.chainId.initializedPromise
        await this.walletStorage?.wallets.initializedPromise

        await this.onAccountChanged()
        await this.onChainChanged()

        this.walletStorage?.account.subscription.subscribe(this.onAccountChanged.bind(this))
        this.walletStorage?.chainId.subscription.subscribe(this.onChainChanged.bind(this))
    }

    protected get options() {
        return {
            isSupportedAccount: () => true,
            isSupportedChainId: () => true,
            getDefaultAccount: () => '',
            getDefaultChainId,
            formatAddress: formatEthereumAddress,
            ...this.initial,
        }
    }

    override get ready() {
        return [
            this.walletStorage?.wallets.initialized,
            this.walletStorage?.account.initialized,
            this.walletStorage?.chainId.initialized,
        ].every((x) => !!x)
    }

    override get readyPromise() {
        return Promise.all([
            this.walletStorage?.wallets.initializedPromise,
            this.walletStorage?.account.initializedPromise,
            this.walletStorage?.chainId.initializedPromise,
        ]).then(() => {})
    }

    override get subscription() {
        if (!this.walletStorage) return super.subscription
        return {
            account: this.walletStorage?.account.subscription,
            chainId: this.walletStorage?.chainId.subscription,
            wallets: this.walletStorage?.wallets.subscription,
        }
    }

    get wallets() {
        return this.walletStorage?.wallets.value ?? EMPTY_LIST
    }

    get hostedAccount() {
        return this.walletStorage?.account.value ?? this.options.getDefaultAccount()
    }

    get hostedChainId() {
        return this.walletStorage?.chainId.value ?? this.options.getDefaultChainId()
    }

    override async addWallet(wallet: Wallet): Promise<void> {
        const now = new Date()
        const address = this.options.formatAddress(wallet.address)

        // already added
        if (this.walletStorage?.wallets.value.some((x) => isSameAddress(x.address, address))) return

        await this.walletStorage?.wallets.setValue([
            ...(this.walletStorage?.wallets.value ?? []),
            {
                ...wallet,
                id: address,
                address,
                name: wallet.name.trim() || `Account ${this.walletStorage?.wallets.value.length + 1}`,
                createdAt: now,
                updatedAt: now,
            },
        ])
    }

    override async updateWallet(
        address: string,
        updates: Partial<Omit<Wallet, 'id' | 'address' | 'createdAt' | 'updatedAt' | 'storedKeyInfo'>>,
    ) {
        const wallet = this.walletStorage?.wallets.value.find((x) => isSameAddress(x.address, address))
        if (!wallet) throw new Error('Failed to find wallet.')

        const now = new Date()
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value.map((x) =>
                isSameAddress(x.address, address)
                    ? {
                          ...x,
                          ...omit(updates, ['id', 'address', 'createdAt', 'updatedAt', 'storedKeyInfo']),
                          createdAt: x.createdAt ?? now,
                          updatedAt: now,
                      }
                    : x,
            ),
        )
    }

    override async updateOrAddWallet(wallet: Wallet) {
        const target = this.walletStorage?.wallets.value.find((x) => isSameAddress(x.address, wallet.address))
        if (target) {
            return this.updateWallet(
                target.address,
                omit(wallet, ['id', 'address', 'createdAt', 'updatedAt', 'storedKeyInfo']),
            )
        }
        await this.addWallet(wallet)
    }

    override async renameWallet(address: string, name: string) {
        await this.updateWallet(address, {
            name,
        })
    }

    override async removeWallet(address: string, password?: string | undefined) {
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value?.filter((x) => !isSameAddress(x.address, address)),
        )
    }

    override async updateWallets(wallets: Wallet[]): Promise<void> {
        if (!wallets.length) return
        const result = wallets.filter(
            (x) =>
                !this.walletStorage?.wallets.value.find(
                    (y) => isSameAddress(x.address, y.address) && isSameAddress(x.owner, y.owner),
                ),
        )
        await this.walletStorage?.wallets.setValue(
            uniqWith([...(this.walletStorage?.wallets.value ?? []), ...result], (a, b) =>
                isSameAddress(a.address, b.address),
            ),
        )
    }

    override async removeWallets(wallets: Wallet[]): Promise<void> {
        if (!wallets.length) return
        await this.walletStorage?.wallets.setValue(
            this.walletStorage?.wallets.value?.filter((x) => !wallets.find((y) => isSameAddress(x.address, y.address))),
        )
    }

    private async onAccountChanged() {
        if (!this.hostedAccount) return

        this.emitter.emit('accounts', [this.hostedAccount])
        await delay(100)
        this.emitter.emit('chainId', toHex(this.hostedChainId))
    }

    private async onChainChanged() {
        if (this.hostedChainId) this.emitter.emit('chainId', toHex(this.hostedChainId))
    }

    override async switchAccount(account?: string) {
        if (!isValidAddress(account)) throw new Error(`Invalid address: ${account}`)

        const supported = await this.options.isSupportedAccount(account)
        if (!supported) throw new Error(`Not supported account: ${account}`)

        await this.walletStorage?.account.setValue(account)
    }

    override async switchChain(chainId: ChainId) {
        const supported = await this.options.isSupportedChainId(chainId)
        if (!supported) throw new Error(`Not supported chain id: ${chainId}`)
        await this.walletStorage?.chainId.setValue(chainId)
    }

    override async request<T>(
        requestArguments: RequestArguments,
        options?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.Web3.getWeb3Provider({
            chainId: options?.chainId || this.hostedChainId,
        }).request<T>(PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill())
    }
}
