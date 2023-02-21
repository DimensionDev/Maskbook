import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'
import { ExtensionSite, getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog/index.js'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog/index.js'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog/index.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog/index.js'
import { DashboardSharedContextSettings } from '../settings.js'
import { DashboardSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { DashboardSelectProviderDialog } from '../SNSAdaptor/DashboardSelectProviderDialog/index.js'
import { DashboardConnectWalletDialog } from '../SNSAdaptor/DashboardConnectWalletDialog/index.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal, context) {
        DashboardSharedContextSettings.value = context
    },
    GlobalInjection() {
        return (
            <DashboardSNSAdaptorContext.Provider value={DashboardSharedContextSettings.value}>
                <DashboardSelectProviderDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <DashboardConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <WalletConnectQRCodeDialog />
            </DashboardSNSAdaptorContext.Provider>
        )
    },
}

export default dashboard
