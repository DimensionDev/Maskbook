import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { DepositDialog } from '../UI/DepositDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <DepositDialog />
    },
}

export default dashboard
