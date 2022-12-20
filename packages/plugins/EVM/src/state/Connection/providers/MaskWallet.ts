import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import { ECKeyIdentifier, ExtensionSite, getSiteType, PopupRoutes } from '@masknet/shared-base'
import { ChainId, chainResolver, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import { SharedContextSettings, Web3StateSettings } from '../../../settings/index.js'
import type { EVM_Provider } from '../types.js'
import { BaseContractWalletProvider } from './BaseContractWallet.js'

export class MaskWalletProvider extends BaseContractWalletProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MaskWallet)
        Web3StateSettings.readyPromise.then(this.addSharedContextListeners.bind(this))
    }

    private addSharedContextListeners() {
        const { account, chainId } = SharedContextSettings.value

        account.subscribe(() => {
            if (this.account) this.emitter.emit('accounts', [this.account])
            else this.emitter.emit('disconnect', ProviderType.MaskWallet)
        })
        chainId.subscribe(() => {
            this.emitter.emit('chainId', toHex(this.chainId))
        })
    }

    override async connect(chainId_: ChainId, address?: string, owner?: string, identifier?: ECKeyIdentifier) {
        // FIXME: testonly
        const chainId = ChainId.Mumbai

        const siteType = getSiteType()
        if (siteType === ExtensionSite.Popup) {
            if (address) {
                await this.switchAccount(address, owner, identifier)
                await this.switchChain(chainId)

                return {
                    account: address,
                    chainId,
                }
            }

            return {
                account: this.account,
                chainId: this.chainId,
            }
        }

        // connected
        if (chainId === this.chainId && isValidAddress(this.account)) {
            if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, true)

            return {
                account: this.account,
                chainId: this.chainId,
            }
        }

        const wallets = Web3StateSettings.value.Wallet?.wallets?.getCurrentValue()
        SharedContextSettings.value.openPopupWindow(wallets?.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet, {
            chainId,
        })

        const account = first(await SharedContextSettings.value.selectAccount())
        if (!account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}`)

        // switch account
        await this.switchAccount(account.address, account.owner, account.identifier)

        // switch chain

        if (chainId !== this.chainId) {
            await this.switchChain(chainId)
        }

        if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, true)

        return {
            chainId,
            account: account.address,
        }
    }

    override async disconnect() {
        const siteType = getSiteType()
        if (siteType) SharedContextSettings.value.recordConnectedSites(siteType, false)
    }
}
