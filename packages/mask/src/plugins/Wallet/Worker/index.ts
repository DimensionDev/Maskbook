import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { MaskMessages } from '@masknet/shared-base'
import { setWalletBackupProvider } from '../../../../background/services/backup/internal_wallet.js'
import { setupDatabase } from '../database/Plugin.db.js'
import '../messages.js'
import {
    exportMnemonic,
    exportPrivateKey,
    getDerivableAccounts,
    getLegacyWallets,
    getWallets,
    isLocked,
    recoverWalletFromMnemonic,
    recoverWalletFromPrivateKey,
} from '../services/index.js'
import { INTERNAL_getPasswordRequired } from '../services/wallet/password.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
        setWalletBackupProvider({
            exportMnemonic,
            exportPrivateKey,
            getDerivableAccounts,
            getLegacyWallets,
            getWallets,
            INTERNAL_getPasswordRequired,
            recoverWalletFromMnemonic,
            recoverWalletFromPrivateKey,
        })
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
