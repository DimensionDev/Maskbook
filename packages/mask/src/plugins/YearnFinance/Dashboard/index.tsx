import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'

import { VaultListDialog } from '../SNSAdaptor/VaultListDialog'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection: function Component() {
        return <VaultListDialog />
    },
}

export default dashboard
