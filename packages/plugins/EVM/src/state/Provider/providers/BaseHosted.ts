import { omit } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import { toHex } from 'web3-utils'
import { delay } from '@masknet/kit'
import { Web3 } from '@masknet/web3-providers'
import { EMPTY_LIST, StorageObject } from '@masknet/shared-base'
import { ProviderOptions, Wallet, isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    getDefaultChainId,
    isValidAddress,
    formatEthereumAddress,
    PayloadEditor,
    ProviderType,
} from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../../../settings/index.js'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'

export class BaseHostedProvider extends BaseProvider implements EVM_Provider {
    protected walletStorage:
        | StorageObject<{
              wallets: Wallet[]
          }>
        | undefined
    protected hostedStorage:
        | StorageObject<{
              account: string
              chainId: ChainId
          }>
        | undefined

    constructor(
        protected override providerType: ProviderType,
        protected initial?: {
            isSupportedAccount?: (account: string) => Promise<boolean>
            isSupportedChainId?: (chainId: ChainId) => Promise<boolean>
            getDefaultAccount?: () => string
            getDefaultChainId?: () => ChainId
            formatAddress?: () => string
        },
    ) {
        super(providerType)
    }

    override async setup() {
        const context = await SharedContextSettings.readyPromise

        const { storage: walletStorage } = context
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_wallets`, {
                wallets: [] as Wallet[],
            })
        this.walletStorage = walletStorage

        const { storage: hostedStorage } = context
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_hosted`, {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
            })
        this.hostedStorage = hostedStorage

        await this.hostedStorage.account.initializedPromise
        await this.hostedStorage.chainId.initializedPromise

        await this.onAccountChanged()
        await this.onChainChanged()

        this.hostedStorage?.account.subscription.subscribe(this.onAccountChanged.bind(this))
        this.hostedStorage?.chainId.subscription.subscribe(this.onChainChanged.bind(this))
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
            this.hostedStorage?.account.initialized,
            this.hostedStorage?.chainId.initialized,
        ].every((x) => !!x)
    }

    override get readyPromise() {
        return Promise.all([
            this.walletStorage?.wallets.initializedPromise,
            this.hostedStorage?.account.initializedPromise,
            this.hostedStorage?.chainId.initializedPromise,
        ]).then(() => {})
    }

    get wallets() {
        return this.walletStorage?.wallets.value ?? EMPTY_LIST
    }

    get hostedAccount() {
        return this.hostedStorage?.account.value ?? this.options.getDefaultAccount()
    }

    get hostedChainId() {
        return this.hostedStorage?.chainId.value ?? this.options.getDefaultChainId()
    }

    override async addWallet(wallet: Wallet): Promise<void> {
        const now = new Date()
        const address = this.options.formatAddress(wallet.address)

        // already added
        if (this.wallets.some((x) => isSameAddress(x.address, address))) return

        await this.walletStorage?.wallets.setValue([
            ...this.wallets,
            {
                ...wallet,
                id: address,
                address,
                name: wallet.name.trim() || `Account ${this.wallets.length + 1}`,
                createdAt: now,
                updatedAt: now,
            },
        ])
    }

    override async updateWallet(
        address: string,
        updates: Partial<Omit<Wallet, 'id' | 'address' | 'createdAt' | 'updatedAt' | 'storedKeyInfo'>>,
    ) {
        const wallet = this.wallets.find((x) => isSameAddress(x.address, address))
        if (!wallet) throw new Error('Failed to find wallet.')

        const now = new Date()
        await this.walletStorage?.wallets.setValue(
            this.wallets.map((x) =>
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
        const target = this.wallets.find((x) => isSameAddress(x.address, wallet.address))
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
        await this.walletStorage?.wallets.setValue(this.wallets?.filter((x) => !isSameAddress(x.address, address)))
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

        await this.hostedStorage?.account.setValue(account)
    }

    override async switchChain(chainId: ChainId) {
        const supported = await this.options.isSupportedChainId(chainId)
        if (!supported) throw new Error(`Not supported chain id: ${chainId}`)

        await this.hostedStorage?.chainId.setValue(chainId)
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        return Web3.getWeb3Provider(options?.chainId || this.hostedChainId).request<T>(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
        )
    }
}
