import { delay } from '@masknet/kit'
import { ECKeyIdentifier, type StorageItem } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ProviderType, isValidAddress, type ChainId, type Web3Provider, type Web3 } from '@masknet/web3-shared-evm'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import { BaseHostedProvider } from './BaseHosted.js'
import { SmartPayBundlerAPI } from '../../../SmartPay/index.js'
import type { WalletAPI } from '../../../entry-types.js'

/**
 * EIP-4337 compatible smart contract based wallet.
 */
export class BaseContractWalletProvider
    extends BaseHostedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    protected Bundler = new SmartPayBundlerAPI()

    private ownerStorage:
        | StorageItem<{
              account: string
              identifier: string
          }>
        | undefined

    constructor(protected override providerType: ProviderType) {
        super(providerType)
    }

    override async setup(context?: Plugin.SNSAdaptor.SNSAdaptorContext) {
        await super.setup(context)

        this.ownerStorage = context?.createKVStorage('memory', {}).createSubScope(`${this.providerType}_owner`, {
            value: {
                account: this.options.getDefaultAccount(),
                // empty string means EOA signer
                identifier: '',
            },
        })?.storage.value

        await this.ownerStorage?.initializedPromise

        this.subscription.wallets?.subscribe(async () => {
            if (!this.hostedAccount) return
            const target = this.wallets?.find((x) => isSameAddress(x.address, this.hostedAccount))
            const smartPayChainId = await this.Bundler.getSupportedChainId()
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

    override get ready() {
        return [this.ownerStorage?.initialized].every((x) => !!x)
    }

    override get readyPromise() {
        return Promise.all([super.readyPromise, this.ownerStorage?.initializedPromise]).then(() => {})
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
