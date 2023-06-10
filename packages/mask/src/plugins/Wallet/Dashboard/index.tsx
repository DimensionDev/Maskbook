import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ExtensionSite, getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog/index.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { Modals } from '@masknet/shared'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <ConnectWalletDialog />
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <Modals />
            </>
        )
    },
}

export default dashboard
