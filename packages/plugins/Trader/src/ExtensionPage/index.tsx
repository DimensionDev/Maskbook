import type { Plugin } from '@masknet/plugin-infra'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { TraderDialog } from '../SiteAdaptor/trader/TraderDialog.js'
import { base } from '../base.js'
import { shareToTwitterAsPopup } from '@masknet/shared-base-ui'

const extensionPage: Plugin.ExtensionPage.Definition = {
    ...base,
    GlobalInjection() {
        return (
            <EVMWeb3ContextProvider>
                <TraderDialog share={shareToTwitterAsPopup} />
            </EVMWeb3ContextProvider>
        )
    },
}

export default extensionPage
