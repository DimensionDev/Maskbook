import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { MaskMessages } from '../../../utils'
import { setupDatabase } from '../database/Plugin.db'
import '../messages'
import { isLocked } from '../services'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {
        setupDatabase(context.getDatabaseStorage())
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
