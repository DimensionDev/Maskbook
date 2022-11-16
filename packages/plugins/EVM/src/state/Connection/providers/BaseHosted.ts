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
    private mask = new MaskWalletProvider()
    private storageObject:
        | StorageObject<{
              account: string
              chainId: ChainId
          }>
        | undefined

    constructor(
        protected override providerType: ProviderType,
        protected options: {
            isSupportedAccount(account: string): boolean
            isSupportedChainId(chainId: ChainId): boolean
            getDefaultAccount(): string
            getDefaultChainId(): ChainId
        } = {
            isSupportedAccount: () => true,
            isSupportedChainId: () => true,
            getDefaultAccount: () => '',
            getDefaultChainId,
        },
    ) {
        super(providerType)
        Web3StateSettings.readyPromise.then(this.addListeners.bind(this))
    }

    private get storage() {
        if (this.storageObject) return this.storageObject
        const { storage } = SharedContextSettings.value
            .createKVStorage('memory', {})
            .createSubScope(this.providerType, {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
            })
        this.storageObject = storage
        return this.storageObject
    }

    private get account() {
        return this.storage.account.value
    }

    private get chainId() {
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

    protected selectAccount(account: string) {
        if (isValidAddress(account) && this.options.isSupportedAccount(account)) this.storage.account.setValue(account)
    }

    protected switchChainId(chainId: ChainId) {
        if (this.options.isSupportedChainId(chainId)) this.storage.chainId.setValue(chainId)
    }

    protected reset() {
        this.storage.account.setValue(this.options.getDefaultAccount())
        this.storage.chainId.setValue(this.options.getDefaultChainId())
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.mask.request<T>(requestArguments, {
            account: this.account,
            chainId: this.chainId,
            ...options,
        })
    }
}
