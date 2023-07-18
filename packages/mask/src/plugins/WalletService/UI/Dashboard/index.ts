import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../../base.js'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { resolveMaskAccount } from '../../services/account.js'
import {
    changePassword,
    createMnemonicWords,
    createWalletFromMnemonicWords,
    exportMnemonicWords,
    exportPrivateKey,
    generateAddressFromMnemonicWords,
    getDerivableAccounts,
    getWallets,
    hasPassword,
    recoverWalletFromKeyStoreJSON,
    recoverWalletFromMnemonicWords,
    recoverWalletFromPrivateKey,
    resetPassword,
    setDefaultPassword,
    setPassword,
    verifyPassword,
} from '../../services/index.js'
import { getLegacyWallets } from '../../services/legacyWallet.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        WalletServiceRef.value = {
            changePassword,
            createMnemonicWords: async () => createMnemonicWords(),
            createWalletFromMnemonicWords,
            exportMnemonicWords,
            exportPrivateKey,
            generateAddressFromMnemonicWords,
            getDerivableAccounts,
            getLegacyWallets,
            getWallets,
            hasPassword,
            recoverWalletFromKeyStoreJSON,
            recoverWalletFromMnemonicWords,
            recoverWalletFromPrivateKey,
            resetPassword,
            resolveMaskAccount,
            setDefaultPassword,
            setPassword,
            verifyPassword,
        }
    },
}

export default dashboard
