import { first } from 'lodash-es'
import { ExtensionSite, getSiteType, PopupRoutes } from '@masknet/shared-base'
import { ChainId, chainResolver, isValidAddress, ProviderType } from '@masknet/web3-shared-evm'
import { BaseContractWalletProvider } from './BaseContractWallet.js'
import type { EVM_Provider } from '../types.js'
import { SharedContextSettings } from '../../../settings/index.js'

/**
 * PayGasX
 * Learn more: https://github.com/DimensionDev/PayGasX
 */
export class SmartPayProvider extends BaseContractWalletProvider implements EVM_Provider {
    private siteType = getSiteType()

    constructor() {
        super(ProviderType.SmartPay, {
            isSupportedAccount: (account: string) => Promise.resolve(isValidAddress(account)),
            isSupportedChainId: (chainId: ChainId) => Promise.resolve(chainId === ChainId.Matic),
            getDefaultAccount: () => '',
            getDefaultChainId: () => ChainId.Matic,
        })
    }

    override async connect(chainId: ChainId) {
        if (this.siteType === ExtensionSite.Popup) throw new Error('Cannot connect wallet')

        // connected
        if (chainId === this.chainId && isValidAddress(this.account)) {
            return {
                account: this.account,
                chainId: this.chainId,
            }
        }

        // open popups
        const wallets = await SharedContextSettings.value.getWallets()
        SharedContextSettings.value.openPopupWindow(wallets.length ? PopupRoutes.SelectWallet : PopupRoutes.Wallet, {
            chainId,
        })

        // switch account
        const account = first(await SharedContextSettings.value.selectAccount())
        if (account) await this.switchAccount(account, '', ProviderType.MaskWallet)
        if (!account || account !== this.account)
            throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        // switch chain
        if (chainId !== this.chainId) await this.switchChain(chainId)
        if (chainId !== this.chainId) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)

        return {
            chainId,
            account,
        }
    }
}
