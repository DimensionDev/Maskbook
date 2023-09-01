import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import Services from '#services'

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
    hasPasswordWithDefaultOne: Services.Wallet.hasPasswordWithDefaultOne,
    generateAddressFromKeyStoreJSON: Services.Wallet.generateAddressFromKeyStoreJSON,
    recoverWalletFromKeyStoreJSON: Services.Wallet.recoverWalletFromKeyStoreJSON,
    renameWallet: Services.Wallet.renameWallet,
    recoverWalletFromMnemonicWords: Services.Wallet.recoverWalletFromMnemonicWords,
    generateAddressFromPrivateKey: Services.Wallet.generateAddressFromPrivateKey,
    recoverWalletFromPrivateKey: Services.Wallet.recoverWalletFromPrivateKey,
    resetPassword: Services.Wallet.resetPassword,
    resolveMaskAccount: Services.Wallet.resolveMaskAccount,
    setDefaultPassword: Services.Wallet.setDefaultPassword,
    isLocked: Services.Wallet.isLocked,
    setPassword: Services.Wallet.setPassword,
    verifyPassword: Services.Wallet.verifyPassword,
    exportPrivateKey: Services.Wallet.exportPrivateKey,
}
