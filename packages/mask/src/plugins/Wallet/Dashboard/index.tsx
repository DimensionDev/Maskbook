import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ExtensionSite, NetworkPluginID, getSiteType } from '@masknet/shared-base'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { Modals, TransactionSnackbar } from '@masknet/shared'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup
                    ? TransactionSnackbar.open({
                          pluginID: NetworkPluginID.PLUGIN_EVM,
                      })
                    : null}
                <Modals />
            </>
        )
    },
}

export default dashboard
