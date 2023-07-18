import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import '../messages.js'
import {
    changePassword,
    exportMnemonicWords,
    exportPrivateKey,
    getDerivableAccounts,
    getLegacyWallets,
    getWallets,
    isLocked,
    recoverWalletFromMnemonicWords,
    generateAddressFromMnemonicWords,
    resetPassword,
    setDefaultPassword,
    recoverWalletFromPrivateKey,
    recoverWalletFromKeyStoreJSON,
    createWalletFromMnemonicWords,
} from '../services/index.js'
import { setupDatabase } from '../database/Plugin.db.js'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
        WalletServiceRef.value = {
            changePassword,
            exportMnemonicWords,
            setDefaultPassword,
            exportPrivateKey,
            recoverWalletFromKeyStoreJSON,
            generateAddressFromMnemonicWords,
            resetPassword,
            getDerivableAccounts,
            getLegacyWallets,
            getWallets,
            recoverWalletFromMnemonicWords,
            recoverWalletFromPrivateKey,
            createWalletFromMnemonicWords,
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
