import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { baseDeferred } from '../base-deferred'
import { SettingsDialog } from '../SNSAdaptor/trader/SettingsDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    ...baseDeferred,
    init(signal) {},
    GlobalInjection: function Component() {
        return (
            <>
                <SettingsDialog />
            </>
        )
    },
}

export default dashboard
