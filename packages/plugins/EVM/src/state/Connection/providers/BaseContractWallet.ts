import { ECKeyIdentifier, StorageItem } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseHostedProvider } from './BaseHosted.js'
import { SharedContextSettings } from '../../../settings/index.js'

const EMPTY_IDENTIFIER = new ECKeyIdentifier('secp256k1', 'EMPTY')

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class BaseContractWalletProvider extends BaseHostedProvider implements EVM_Provider {
    private _ownerStorage?: StorageItem<{
        account: string
        identifier: ECKeyIdentifier
    }>

    get ownerStorage() {
        const { storage } = SharedContextSettings.value
            .createKVStorage('memory', {})
            .createSubScope(`${this.providerType}_hosted`, {
                value: {
                    account: this.options.getDefaultAccount(),
                    // empty string means EOA signer
                    identifier: EMPTY_IDENTIFIER,
                },
            })
        this._ownerStorage = storage.value
        return this._ownerStorage
    }

    get owner() {
        return this.ownerStorage.value.account
    }

    get identifier() {
        const identifier = this.ownerStorage.value.identifier
        return identifier.rawPublicKey === 'EMPTY' ? undefined : identifier
    }

    override async switchAccount(account?: string, owner?: string, identifier = EMPTY_IDENTIFIER) {
        if (!isValidAddress(owner) || !identifier) return

        await super.switchAccount(account)

        // ensure account switching is successful
        if (isSameAddress(this.account, account)) {
            await this.ownerStorage.setValue({
                account: owner,
                identifier,
            })
        }
    }
}
