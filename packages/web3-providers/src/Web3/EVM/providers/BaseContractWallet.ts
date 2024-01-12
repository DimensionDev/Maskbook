import { delay } from '@masknet/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, type StorageItem } from '@masknet/shared-base'
import { type ProviderType, isValidAddress } from '@masknet/web3-shared-evm'
import { BaseHostedProvider, type BaseHostedStorage } from './BaseHosted.js'
import * as SmartPayBundler from /* webpackDefer: true */ '../../../SmartPay/index.js'
import type { BundlerAPI } from '../../../entry-types.js'

export type EIP4337ProviderStorage = StorageItem<{
    account: string
    identifier: string
}>
/**
 * EIP-4337 compatible smart contract based wallet.
 */
export abstract class BaseEIP4337WalletProvider extends BaseHostedProvider {
    protected Bundler: BundlerAPI.Provider = SmartPayBundler.SmartPayBundler

    constructor(
        providerType: ProviderType,
        baseHostedStorage: BaseHostedStorage,
        private ownerStorage: EIP4337ProviderStorage,
    ) {
        super(providerType, baseHostedStorage)
    }

    override setup() {
        super.setup()

        this.subscription.wallets.subscribe(async () => {
            if (!this.hostedAccount) return
            const target = this.wallets.find((x) => isSameAddress(x.address, this.hostedAccount))
            const smartPayChainId = await this.Bundler.getSupportedChainId()
            if (target?.owner) {
                await this.ownerStorage.setValue({
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
        return this.ownerStorage.value.account
    }

    get ownerIdentifier() {
        const identifier = ECKeyIdentifier.from(this.ownerStorage.value.identifier).unwrapOr(undefined)
        return identifier?.rawPublicKey === 'EMPTY' ? undefined : identifier
    }

    override async switchAccount(account?: string, owner?: { account: string; identifier?: ECKeyIdentifier }) {
        await super.switchAccount(account)

        if (!owner || !isValidAddress(owner.account)) {
            await this.ownerStorage.setValue({
                account: this.getDefaultAccount(),
                identifier: owner?.identifier?.toText() ?? '',
            })
        } else {
            // delay for syncing storage
            await delay(300)

            // ensure account switching is successful
            if (!isSameAddress(this.hostedAccount, account)) return

            await this.ownerStorage.setValue({
                account: owner.account,
                identifier: owner.identifier?.toText() ?? '',
            })
        }
    }
}
