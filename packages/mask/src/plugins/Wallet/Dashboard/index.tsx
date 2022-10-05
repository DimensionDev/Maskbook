import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { NetworkPluginID } from '@masknet/shared-base'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog.js'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog/index.js'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog/index.js'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog/index.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog/index.js'
import { ExtensionSite, getSiteType } from '@masknet/shared-base'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <SelectProviderDialog />
                <SelectNftContractDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
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
