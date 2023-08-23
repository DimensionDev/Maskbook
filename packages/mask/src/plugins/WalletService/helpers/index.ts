import { WalletRPC } from '../messages.js'

export function createWalletService() {
    return {
        getLegacyWallets: WalletRPC.getLegacyWallets,
        getWallets: WalletRPC.getWallets,
        getDerivableAccounts: WalletRPC.getDerivableAccounts,
        changePassword: WalletRPC.changePassword,
        setPassword: WalletRPC.setPassword,
        verifyPassword: WalletRPC.verifyPassword,
        hasPassword: WalletRPC.hasPassword,
        hasPasswordWithDefaultOne: WalletRPC.hasPasswordWithDefaultOne,
        resetPassword: WalletRPC.resetPassword,
        setDefaultPassword: WalletRPC.setDefaultPassword,

        createMnemonicWords: WalletRPC.createMnemonicWords,
        exportMnemonicWords: WalletRPC.exportMnemonicWords,
        exportPrivateKey: WalletRPC.exportPrivateKey,
        createWalletFromMnemonicWords: WalletRPC.createWalletFromMnemonicWords,
        recoverWalletFromPrivateKey: WalletRPC.recoverWalletFromPrivateKey,
        recoverWalletFromKeyStoreJSON: WalletRPC.recoverWalletFromKeyStoreJSON,
        recoverWalletFromMnemonicWords: WalletRPC.recoverWalletFromMnemonicWords,
        renameWallet: WalletRPC.renameWallet,
        resolveMaskAccount: WalletRPC.resolveMaskAccount,
        generateAddressFromMnemonicWords: WalletRPC.generateAddressFromMnemonicWords,
    }
}
