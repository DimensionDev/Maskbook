import type { Plugin } from '@masknet/plugin-infra'
import { base } from '@masknet/plugin-wallet'
import { SelectNftContractDialog } from './SelectNftContractDialog.js'
import { SelectProviderDialog } from './SelectProviderDialog/index.js'
import { WalletStatusDialog } from './WalletStatusDialog/index.js'
import { ConnectWalletDialog } from './ConnectWalletDialog/index.js'
import { WalletRiskWarningDialog } from './RiskWarningDialog/index.js'
import { GasSettingDialog } from './GasSettingDialog/index.js'
import { TransactionSnackbar } from './TransactionSnackbar/index.js'
import { ApplicationBoardDialog } from '../../../components/shared/ApplicationBoardDialog.js'
import { WalletConnectQRCodeDialog } from './WalletConnectQRCodeDialog/index.js'
import { getEnumAsArray } from '@dimensiondev/kit'
import { GlobalDialogRoutes, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { LeavePageConfirmDialog } from '../../../components/shared/LeavePageConfirmDialog.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    GlobalInjection() {
        return (
            <>
                {/* <SelectProviderDialog /> */}
                <SelectNftContractDialog />
                {/* <WalletStatusDialog /> */}
                <ApplicationBoardDialog />
                <ConnectWalletDialog />
                <WalletRiskWarningDialog />
                <GasSettingDialog />
                {getEnumAsArray(NetworkPluginID).map(({ key, value: pluginID }) => (
                    <TransactionSnackbar key={key} pluginID={pluginID} />
                ))}
                <WalletConnectQRCodeDialog />
                <LeavePageConfirmDialog />
            </>
        )
    },
    GlobalDialogCotnents: [
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
    ],
}

export default sns
