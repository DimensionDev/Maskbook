import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ExtensionSite, getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { Modals } from '@masknet/shared'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <Modals />
            </>
        )
    },
}

export default dashboard
