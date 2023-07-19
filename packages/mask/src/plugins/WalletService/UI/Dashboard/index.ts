import type { Plugin } from '@masknet/plugin-infra'
import { WalletServiceRef } from '@masknet/plugin-infra/dom'
import { createWalletService } from '../../helpers/index.js'
import { base } from '../../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        WalletServiceRef.value = createWalletService()
    },
}

export default dashboard
