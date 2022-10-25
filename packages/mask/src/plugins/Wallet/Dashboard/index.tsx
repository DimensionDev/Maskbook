import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { ExtensionSite, getSiteType, GlobalDialogRoutes, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { SelectNftContractDialog } from '../SNSAdaptor/SelectNftContractDialog.js'
import { GasSettingDialog } from '../SNSAdaptor/GasSettingDialog/index.js'
import { TransactionSnackbar } from '../SNSAdaptor/TransactionSnackbar/index.js'
import { WalletConnectQRCodeDialog } from '../SNSAdaptor/WalletConnectQRCodeDialog/index.js'
import { WalletStatusDialog } from '../SNSAdaptor/WalletStatusDialog/index.js'
import { SelectProviderDialog } from '../SNSAdaptor/SelectProviderDialog/index.js'
import { ConnectWalletDialog } from '../SNSAdaptor/ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from '../SNSAdaptor/RiskWarningDialog/index.js'

const dashboard: Plugin.Dashboard.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                <SelectNftContractDialog />
                <GasSettingDialog />
                {getSiteType() !== ExtensionSite.Popup ? (
                    <TransactionSnackbar pluginID={NetworkPluginID.PLUGIN_EVM} />
                ) : null}
                <WalletConnectQRCodeDialog />
            </>
        )
    },
    GlobalDialogContents: [
        {
            ID: PluginID.Wallet,
            path: GlobalDialogRoutes.WalletStatus,
            label: {
                i18nKey: 'wallet_account',
                fallback: 'Wallet Account',
            },
            UI: {
                DialogContent: WalletStatusDialog,
            },
        },
        {
            ID: PluginID.Wallet,
            path: GlobalDialogRoutes.SelectProvider,
            label: {
                i18nKey: 'connect_wallet',
                fallback: 'Connect Wallet',
            },
            UI: {
                DialogContent: SelectProviderDialog,
            },
        },
        {
            ID: PluginID.Wallet,
            path: GlobalDialogRoutes.ConnectWallet,
            label: {
                i18nKey: 'wallet_account',
                fallback: 'Wallet Account',
            },
            UI: {
                DialogContent: ConnectWalletDialog,
            },
        },
        {
            ID: PluginID.Wallet,
            path: GlobalDialogRoutes.RiskWarning,
            label:
                process.env.architecture !== 'app'
                    ? {
                          i18nKey: 'risk_warning',
                          fallback: 'Risk Warning',
                      }
                    : undefined,
            UI: {
                DialogContent: WalletRiskWarningDialog,
            },
        },
    ],
}

export default dashboard
