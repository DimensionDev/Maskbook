import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { DepositDialog } from '../UI/DepositDialog.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <DepositDialog />
    },
}

export default dashboard
