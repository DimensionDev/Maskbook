import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { TraderxyzDialog } from '../SNSAdaptor/trader/TraderDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <TraderxyzDialog />
            </>
        )
    },
}

export default dashboard
