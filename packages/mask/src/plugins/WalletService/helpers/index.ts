import { WalletRPC } from '../messages.js'

export function createWalletService() {
    return {
        changePassword: WalletRPC.changePassword,
        createMnemonicWords: WalletRPC.createMnemonicWords,
        createWalletFromMnemonicWords: WalletRPC.createWalletFromMnemonicWords,
        exportMnemonicWords: WalletRPC.exportMnemonicWords,
        generateAddressFromMnemonicWords: WalletRPC.generateAddressFromMnemonicWords,
        getDerivableAccounts: WalletRPC.getDerivableAccounts,
        getLegacyWallets: WalletRPC.getLegacyWallets,
        getWallets: WalletRPC.getWallets,
        hasPassword: WalletRPC.hasPassword,
        recoverWalletFromKeyStoreJSON: WalletRPC.recoverWalletFromKeyStoreJSON,
        recoverWalletFromMnemonicWords: WalletRPC.recoverWalletFromMnemonicWords,
        recoverWalletFromPrivateKey: WalletRPC.recoverWalletFromPrivateKey,
        resetPassword: WalletRPC.resetPassword,
        resolveMaskAccount: WalletRPC.resolveMaskAccount,
        setDefaultPassword: WalletRPC.setDefaultPassword,
        setPassword: WalletRPC.setPassword,
        verifyPassword: WalletRPC.verifyPassword,
        exportPrivateKey: WalletRPC.exportPrivateKey,
    }
}
