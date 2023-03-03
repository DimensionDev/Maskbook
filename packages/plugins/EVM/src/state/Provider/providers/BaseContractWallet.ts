import { delay } from '@masknet/kit'
import { ECKeyIdentifier, type StorageItem } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { type ProviderType, isValidAddress } from '@masknet/web3-shared-evm'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import { BaseHostedProvider } from './BaseHosted.js'
import type { EVM_Provider } from '../types.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class BaseContractWalletProvider extends BaseHostedProvider implements EVM_Provider {
    private ownerStorage:
        | StorageItem<{
              account: string
              identifier: string
          }>
        | undefined

    constructor(protected override providerType: ProviderType) {
        super(providerType)
    }

    override async setup() {
        await super.setup()

        const context = await SharedContextSettings.readyPromise
        const state = await Web3StateSettings.readyPromise

        const { storage } = context.createKVStorage('memory', {}).createSubScope(`${this.providerType}_owner`, {
            value: {
                account: this.options.getDefaultAccount(),
                // empty string means EOA signer
                identifier: '',
            },
        })

        this.ownerStorage = storage.value

        state.Wallet?.wallets?.subscribe(async () => {
            if (!this.hostedAccount) return
            const wallets = state.Wallet?.wallets?.getCurrentValue()
            const target = wallets?.find((x) => isSameAddress(x.address, this.hostedAccount))
            const smartPayChainId = await SmartPayBundler.getSupportedChainId()
            if (target?.owner) {
                await this.ownerStorage?.setValue({
                    account: target.owner,
                    identifier: target.identifier ?? '',
                })
                if (this.hostedChainId !== smartPayChainId) {
                    await this.switchChain(smartPayChainId)
                }
            }
        })
    }

    get ownerAccount() {
        return this.ownerStorage?.value.account ?? this.options.getDefaultAccount()
    }

    get ownerIdentifier() {
        const identifier = ECKeyIdentifier.from(this.ownerStorage?.value.identifier).unwrapOr(undefined)
        return identifier?.rawPublicKey === 'EMPTY' ? undefined : identifier
    }

    override async switchAccount(account?: string, owner?: { account: string; identifier?: ECKeyIdentifier }) {
        await super.switchAccount(account)

        if (!owner || !isValidAddress(owner.account)) {
            await this.ownerStorage?.setValue({
                account: this.options.getDefaultAccount(),
                identifier: owner?.identifier?.toText() ?? '',
            })
        } else {
            // delay for syncing storage
            await delay(300)

            // ensure account switching is successful
            if (!isSameAddress(this.hostedAccount, account)) return

            await this.ownerStorage?.setValue({
                account: owner.account,
                identifier: owner.identifier?.toText() ?? '',
            })
        }
    }
}
