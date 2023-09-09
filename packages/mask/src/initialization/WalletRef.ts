import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import Services from '#services'

WalletServiceRef.value = {
    renameWallet: Services.Wallet.renameWallet,
}
