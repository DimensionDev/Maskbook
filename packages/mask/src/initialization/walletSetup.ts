import Services from '#services'
import { initWallet } from '@masknet/web3-providers'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../utils/plugin-context-shared-ui.js'

initWallet({
    ...RestPartOfPluginUIContextShared,
    MaskWalletContext: {
        allPersonas: NextSharedUIContext.allPersonas,
        resetAllWallets: Services.Wallet.resetAllWallets,
        removeWallet: Services.Wallet.removeWallet,
        renameWallet: Services.Wallet.renameWallet,
    },
})
