import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ExtensionSite, getSiteType, NetworkPluginID } from '@masknet/shared-base'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog.js'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog/index.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog/index.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                {/* <SelectProviderDialog /> */}
                <SelectNftContractDialog />
                {/* <WalletStatusDialog /> */}
                {/* <ConnectWalletDialog /> */}
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}

export default dashboard
