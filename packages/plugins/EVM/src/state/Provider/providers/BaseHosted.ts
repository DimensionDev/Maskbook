import type { RequestArguments } from 'web3-core'
import { toHex } from 'web3-utils'
import { delay } from '@masknet/kit'
import { Web3 } from '@masknet/web3-providers'
import type { StorageObject } from '@masknet/shared-base'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, getDefaultChainId, isValidAddress, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../../../settings/index.js'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'

export class BaseHostedProvider extends BaseProvider implements EVM_Provider {
    private hostedStorage:
        | StorageObject<{
              account: string
              chainId: ChainId
          }>
        | undefined

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
    }

    override async setup() {
        const { storage } = SharedContextSettings.value
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_hosted`, {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
            })
        this.hostedStorage = storage

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
            ...this.init,
        }
    }

    override get ready() {
        return [this.hostedStorage?.account.initialized, this.hostedStorage?.chainId.initialized].every((x) => !!x)
    }

    override get readyPromise() {
        return Promise.all([
            this.hostedStorage?.account.initializedPromise,
            this.hostedStorage?.chainId.initializedPromise,
        ]).then(() => {})
    }

    get hostedAccount() {
        return this.hostedStorage?.account.value ?? this.options.getDefaultAccount()
    }

    get hostedChainId() {
        return this.hostedStorage?.chainId.value ?? this.options.getDefaultChainId()
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
