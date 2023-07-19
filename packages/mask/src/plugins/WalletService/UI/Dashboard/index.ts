import type { Plugin } from '@masknet/plugin-infra'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { base } from '../../base.js'
import { createWalletService } from '../../helpers/index.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        WalletServiceRef.value = createWalletService()
    },
}

export default dashboard
