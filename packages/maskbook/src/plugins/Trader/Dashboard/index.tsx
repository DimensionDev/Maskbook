import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { SettingsDialog } from '../SNSAdaptor/trader/SettingsDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
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
