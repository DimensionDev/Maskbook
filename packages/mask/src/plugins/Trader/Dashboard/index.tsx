import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { TraderDialog } from '../SNSAdaptor/trader/TraderDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <TraderDialog />
            </>
        )
    },
}

export default dashboard
