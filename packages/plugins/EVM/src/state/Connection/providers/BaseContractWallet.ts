import type { StorageObject } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseHostedProvider } from './BaseHosted.js'
import { SharedContextSettings } from '../../../settings/index.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class BaseContractWalletProvider extends BaseHostedProvider implements EVM_Provider {
    private _ownerStorage?: StorageObject<{
        account: string
        providerType: ProviderType
    }>

    get ownerStorage() {
        const { storage } = SharedContextSettings.value
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_hosted`, {
                account: this.options.getDefaultAccount(),
                providerType: ProviderType.None,
            })
        this._ownerStorage = storage
        return this._ownerStorage
    }

    get owner() {
        return this.ownerStorage.account.value
    }

    get ownerProviderType() {
        return this.ownerStorage.providerType.value
    }

    override async switchAccount(account?: string, owner?: string, ownerProviderType?: ProviderType) {
        if (isValidAddress(owner) && ownerProviderType && ownerProviderType !== ProviderType.None) {
            await super.switchAccount(account)

            if (isSameAddress(this.account, account)) {
                this.ownerStorage.account.setValue(owner)
                this.ownerStorage.providerType.setValue(ownerProviderType)
            }
        }
    }
}
