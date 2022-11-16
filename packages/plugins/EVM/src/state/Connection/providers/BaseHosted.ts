import { ChainId, getDefaultChainId, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import { SharedContextSettings } from '../../../settings/index.js'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

export class BaseHostedProvider extends BaseProvider implements EVM_Provider {
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
    }

    private get storage() {
        const { storage } = SharedContextSettings.value.createKVStorage('memory', {
            account: this.options.getDefaultAccount(),
            chainId: this.options.getDefaultChainId(),
        })
        return storage
    }

    protected selectAccount(account: string) {
        if (isValidAddress(account) && this.options.isSupportedAccount(account)) this.storage.account.setValue(account)
    }

    protected switchChainId(chainId: ChainId) {
        if (this.options.isSupportedChainId(chainId)) this.storage.chainId.setValue(chainId)
    }
}
