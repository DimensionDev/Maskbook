import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { WalletRPC } from '../plugins/WalletService/messages.js'

WalletServiceRef.value = {
    changePassword: WalletRPC.changePassword,
    createMnemonicWords: WalletRPC.createMnemonicWords,
    createWalletFromMnemonicWords: WalletRPC.createWalletFromMnemonicWords,
    exportMnemonicWords: WalletRPC.exportMnemonicWords,
    generateAddressFromMnemonicWords: WalletRPC.generateAddressFromMnemonicWords,
    getDerivableAccounts: WalletRPC.getDerivableAccounts,
    getLegacyWallets: WalletRPC.getLegacyWallets,
    getWallets: WalletRPC.getWallets,
    hasPassword: WalletRPC.hasPassword,
    hasPasswordWithDefaultOne: WalletRPC.hasPasswordWithDefaultOne,
    recoverWalletFromKeyStoreJSON: WalletRPC.recoverWalletFromKeyStoreJSON,
    renameWallet: WalletRPC.renameWallet,
    recoverWalletFromMnemonicWords: WalletRPC.recoverWalletFromMnemonicWords,
    recoverWalletFromPrivateKey: WalletRPC.recoverWalletFromPrivateKey,
    resetPassword: WalletRPC.resetPassword,
    resolveMaskAccount: WalletRPC.resolveMaskAccount,
    setDefaultPassword: WalletRPC.setDefaultPassword,
    setPassword: WalletRPC.setPassword,
    verifyPassword: WalletRPC.verifyPassword,
    exportPrivateKey: WalletRPC.exportPrivateKey,
}
