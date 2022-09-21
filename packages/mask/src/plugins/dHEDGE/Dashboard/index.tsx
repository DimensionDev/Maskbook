import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { InvestDialog } from '../UI/InvestDialog.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return <InvestDialog />
    },
}

export default dashboard
