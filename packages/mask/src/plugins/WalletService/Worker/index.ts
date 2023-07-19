import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { isLocked } from '../services/index.js'
import { setupDatabase } from '../database/Plugin.db.js'
import { createWalletService } from '../helpers/index.js'
import '../messages.js'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
        WalletServiceRef.value = createWalletService()
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
