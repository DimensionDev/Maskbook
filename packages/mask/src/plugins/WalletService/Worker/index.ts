import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import '../messages.js'
import {
    hasPassword,
    changePassword,
    setPassword,
    verifyPassword,
    resetPassword,
    exportMnemonicWords,
    exportPrivateKey,
    getDerivableAccounts,
    getLegacyWallets,
    getWallets,
    isLocked,
    recoverWalletFromMnemonicWords,
    generateAddressFromMnemonicWords,
    setDefaultPassword,
    recoverWalletFromPrivateKey,
    recoverWalletFromKeyStoreJSON,
    createWalletFromMnemonicWords,
    createMnemonicWords,
    resolveMaskAccount,
} from '../services/index.js'
import { setupDatabase } from '../database/Plugin.db.js'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
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
        MaskMessages.events.wallet_is_locked.on(
            async ([type]) => {
                if (type === 'request') {
                    MaskMessages.events.wallet_is_locked.sendToLocal(['response', await isLocked()])
                }
            },
            { signal },
        )
    },
}
export default worker
