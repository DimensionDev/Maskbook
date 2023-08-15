import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import Services from '../extension/service.js'

WalletServiceRef.value = {
    changePassword: Services.Wallet.changePassword,
    createMnemonicWords: Services.Wallet.createMnemonicWords,
    createWalletFromMnemonicWords: Services.Wallet.createWalletFromMnemonicWords,
    exportMnemonicWords: Services.Wallet.exportMnemonicWords,
    generateAddressFromMnemonicWords: Services.Wallet.generateAddressFromMnemonicWords,
    getDerivableAccounts: Services.Wallet.getDerivableAccounts,
    getLegacyWallets: Services.Wallet.getLegacyWallets,
    getWallets: Services.Wallet.getWallets,
    hasPassword: Services.Wallet.hasPassword,
    recoverWalletFromKeyStoreJSON: Services.Wallet.recoverWalletFromKeyStoreJSON,
    recoverWalletFromMnemonicWords: Services.Wallet.recoverWalletFromMnemonicWords,
    recoverWalletFromPrivateKey: Services.Wallet.recoverWalletFromPrivateKey,
    resetPassword: Services.Wallet.resetPassword,
    resolveMaskAccount: Services.Wallet.resolveMaskAccount,
    setDefaultPassword: Services.Wallet.setDefaultPassword,
    setPassword: Services.Wallet.setPassword,
    verifyPassword: Services.Wallet.verifyPassword,
    exportPrivateKey: Services.Wallet.exportPrivateKey,
}
