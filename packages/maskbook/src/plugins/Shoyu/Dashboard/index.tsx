import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { InvestDialog } from '../UI/InvestDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <InvestDialog />
    },
}

export default dashboard
