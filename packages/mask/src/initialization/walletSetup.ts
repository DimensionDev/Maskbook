import Services from '#services'
import { Providers } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { NextSharedUIContext } from '../utils/plugin-context-shared-ui.js'

Providers[ProviderType.MaskWallet].setIOContext({
    allPersonas: NextSharedUIContext.allPersonas,
    resetAllWallets: Services.Wallet.resetAllWallets,
    removeWallet: Services.Wallet.removeWallet,
    renameWallet: Services.Wallet.renameWallet,
})
