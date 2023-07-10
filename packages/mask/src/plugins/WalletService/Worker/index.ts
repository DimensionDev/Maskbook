import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import '../messages.js'
import {
    exportMnemonic,
    exportPrivateKey,
    getDerivableAccounts,
    getLegacyWallets,
    getWallets,
    isLocked,
    recoverWalletFromMnemonic,
    generateAddressFromMnemonic,
    recoverWalletFromPrivateKey,
    recoverWalletFromKeyStoreJSON,
} from '../services/index.js'
import { INTERNAL_getPasswordRequired } from '../services/wallet/password.js'
import { setupDatabase } from '../database/Plugin.db.js'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
        WalletServiceRef.value = {
            exportMnemonic,
            exportPrivateKey,
            recoverWalletFromKeyStoreJSON,
            generateAddressFromMnemonic,
            getDerivableAccounts,
            getLegacyWallets,
            getWallets,
            INTERNAL_getPasswordRequired,
            recoverWalletFromMnemonic,
            recoverWalletFromPrivateKey,
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
