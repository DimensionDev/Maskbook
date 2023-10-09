import type { Plugin } from '@masknet/plugin-infra'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SiteAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'
import { shareToTwitterAsPopup } from '@masknet/shared-base-ui'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    GlobalInjection() {
        return (
            <DefaultWeb3ContextProvider>
                <TraderDialog share={shareToTwitterAsPopup} />
            </DefaultWeb3ContextProvider>
        )
    },
}

export default dashboard
