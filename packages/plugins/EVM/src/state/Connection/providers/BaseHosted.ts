import type { RequestArguments } from 'web3-core'
import { toHex } from 'web3-utils'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ExtensionSite, getSiteType, isEnhanceableSiteType, StorageObject } from '@masknet/shared-base'
import { ChainId, getDefaultChainId, isValidAddress, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

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

        // setup storage
        SharedContextSettings.readyPromise.then((context) => {
            const { storage } = context.createKVStorage('memory', {}).createSubScope(`${this.providerType}_hosted`, {
                account: this.options.getDefaultAccount(),
                chainId: this.options.getDefaultChainId(),
            })

            this.hostedStorage = storage

            Web3StateSettings.readyPromise.then(this.addListeners.bind(this))
        })
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

    get account() {
        return this.hostedStorage?.account.value ?? this.options.getDefaultAccount()
    }

    get chainId() {
        return this.hostedStorage?.chainId.value ?? this.options.getDefaultChainId()
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
        this.hostedStorage?.account.subscription.subscribe(() => {
            if (this.account) this.emitter.emit('accounts', [this.account])
            else this.emitter.emit('disconnect', this.providerType)
        })
        this.hostedStorage?.chainId.subscription.subscribe(() => {
            if (this.chainId) this.emitter.emit('chainId', toHex(this.chainId))
        })
    }

    override async switchAccount(account?: string) {
        if (isValidAddress(account) && (await this.options.isSupportedAccount(account))) {
            this.hostedStorage?.account.setValue(account)
        }
    }

    override async switchChain(chainId: ChainId) {
        if (await this.options.isSupportedChainId(chainId)) {
            this.hostedStorage?.chainId.setValue(chainId)
        }
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const response = await SharedContextSettings.value.send(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            {
                chainId: this.chainId,
                popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                ...options,
            },
        )
        return response?.result as T
    }
}
