import { ECKeyIdentifier, StorageItem } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType, isValidAddress } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseHostedProvider } from './BaseHosted.js'
import { SharedContextSettings } from '../../../settings/index.js'

const EMPTY_IDENTIFIER = new ECKeyIdentifier('secp256k1', 'EMPTY')

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class BaseContractWalletProvider extends BaseHostedProvider implements EVM_Provider {
    private ownerStorage:
        | StorageItem<{
              account: string
              identifier: ECKeyIdentifier
          }>
        | undefined

    constructor(protected override providerType: ProviderType) {
        super(providerType)

        // setup storage
        SharedContextSettings.readyPromise.then((context) => {
            const { storage } = context.createKVStorage('memory', {}).createSubScope(`${this.providerType}_owner`, {
                value: {
                    account: this.options.getDefaultAccount(),
                    // empty string means EOA signer
                    identifier: EMPTY_IDENTIFIER,
                },
            })
            this.ownerStorage = storage.value
        })
    }

    get owner() {
        return this.ownerStorage?.value.account ?? this.options.getDefaultAccount()
    }

    get identifier() {
        const identifier = this.ownerStorage?.value.identifier
        return identifier?.rawPublicKey === 'EMPTY' ? undefined : identifier
    }

    override async switchAccount(account?: string, owner?: string, identifier = EMPTY_IDENTIFIER) {
        if (!isValidAddress(owner) || !identifier) {
            await this.ownerStorage?.setValue({
                account: this.options.getDefaultAccount(),
                identifier: EMPTY_IDENTIFIER,
            })
            await super.switchAccount(account)
            return
        }

        await super.switchAccount(account)

        // ensure account switching is successful
        if (isSameAddress(this.account, account)) {
            await this.ownerStorage?.setValue({
                account: owner,
                identifier,
            })
        }
    }
}
