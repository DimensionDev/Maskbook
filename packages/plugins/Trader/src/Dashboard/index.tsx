import type { Plugin } from '@masknet/plugin-infra'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SiteAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <DefaultWeb3ContextProvider>
                <TraderDialog />
            </DefaultWeb3ContextProvider>
        )
    },
}

export default dashboard
