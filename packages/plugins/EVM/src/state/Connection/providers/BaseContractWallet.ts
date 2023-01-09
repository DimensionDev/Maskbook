import { delay } from '@masknet/kit'
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

    get ownerAccount() {
        return this.ownerStorage?.value.account ?? this.options.getDefaultAccount()
    }

    get ownerIdentifier() {
        const identifier = this.ownerStorage?.value.identifier
        return identifier?.rawPublicKey === 'EMPTY' ? undefined : identifier
    }

    override async switchAccount(account?: string, owner?: { account: string; identifier?: ECKeyIdentifier }) {
        await super.switchAccount(account)

        if (!owner || !isValidAddress(owner.account)) {
            await this.ownerStorage?.setValue({
                account: this.options.getDefaultAccount(),
                identifier: owner?.identifier ?? EMPTY_IDENTIFIER,
            })
        } else {
            // delay for syncing storage
            await delay(300)

            // ensure account switching is successful
            if (!isSameAddress(this.hostedAccount, account)) return

            await this.ownerStorage?.setValue({
                account: owner.account,
                identifier: owner.identifier ?? EMPTY_IDENTIFIER,
            })
        }
    }
}
