import type { RequestArguments } from 'web3-core'
import { toHex } from 'web3-utils'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import type { StorageObject } from '@masknet/shared-base'
import { ChainId, getDefaultChainId, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'
import { MaskWalletProvider } from './MaskWallet.js'

export class BaseHostedProvider extends BaseProvider implements EVM_Provider {
    private provider = new MaskWalletProvider()
    private storageObject?: StorageObject<{
        account: string
        chainId: ChainId
    }>

    constructor(
        protected override providerType: ProviderType,
        protected init?: {
            isSupportedAccount?: (account: string) => Promise<boolean>
            isSupportedChainId?: (chainId: ChainId) => Promise<boolean>
            getDefaultAccount?: () => string
            getDefaultChainId?: () => ChainId
        },
    ) {
        super(providerType)
        Web3StateSettings.readyPromise.then(this.addListeners.bind(this))
    }

    protected get options() {
        return {
            isSupportedAccount: () => true,
            isSupportedChainId: () => true,
            getDefaultAccount: () => '',
            getDefaultChainId,
            ...this.init,
        }
    }

    protected get storage() {
        if (this.storageObject) return this.storageObject

        const { storage } = SharedContextSettings.value
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_hosted`, {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
            })
        this.storageObject = storage
        return this.storageObject
    }

    protected get account() {
        return this.storage.account.value
    }

    protected get chainId() {
        return this.storage.chainId.value
    }

    /**
     * Block by the share context
     * @returns
     */
    override get ready() {
        return Web3StateSettings.ready
    }

    /**
     * Block by the share context
     * @returns
     */
    override get readyPromise() {
        return Web3StateSettings.readyPromise.then(() => {})
    }

    private addListeners() {
        const { account, chainId } = this.storage

        account.subscription.subscribe(() => {
            if (this.account) this.emitter.emit('accounts', [this.account])
            else this.emitter.emit('disconnect', this.providerType)
        })
        chainId.subscription.subscribe(() => {
            if (this.account) this.emitter.emit('chainId', toHex(this.chainId))
        })
    }

    override async switchAccount(account?: string) {
        if (isValidAddress(account) && (await this.options.isSupportedAccount(account)))
            this.storage.account.setValue(account)
    }

    override async switchChain(chainId: ChainId) {
        if (await this.options.isSupportedChainId(chainId)) this.storage.chainId.setValue(chainId)
    }

    reset() {
        this.storage.account.setValue(this.options.getDefaultAccount())
        this.storage.chainId.setValue(this.options.getDefaultChainId())
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.provider.request<T>(requestArguments, {
            account: this.account,
            chainId: this.chainId,
            ...options,
        })
    }
}
