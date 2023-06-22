import { memo } from 'react'
import { NetworkPluginID, SingletonModal } from '@masknet/shared-base'
import { WalletStatusModal, type WalletStatusModalOpenProps } from './WalletStatusModal/index.js'
import { SelectProviderModal, type SelectProviderModalOpenProps } from './SelectProviderModal/index.js'
import { WalletConnectQRCodeModal, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeModal/index.js'
import { WalletRiskWarningModal, type WalletRiskWarningModalOpenProps } from './WalletRiskWarningModal/index.js'
import { ConnectWalletModal, type ConnectWalletModalOpenProps } from './ConnectWalletModal/index.js'
import { LeavePageConfirmModal, type LeavePageConfirmModalOpenProps } from './LeavePageConfirmModal/index.js'
import { ApplicationBoardModal, type ApplicationBoardModalOpenProps } from './ApplicationBoardModal/index.js'
import { GasSettingModal, type GasSettingModalOpenOrCloseProps } from './GasSettingModal/index.js'
import { TransactionSnackbarModal, type TransactionSnackbarOpenProps } from './TransactionSnackbar/index.js'

export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderDialog = new SingletonModal<SelectProviderModalOpenProps>()
export const WalletStatusDialog = new SingletonModal<WalletStatusModalOpenProps>()
export const WalletRiskWarningDialog = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletDialog = new SingletonModal<ConnectWalletModalOpenProps>()
export const LeavePageConfirmDialog = new SingletonModal<LeavePageConfirmModalOpenProps>()
export const ApplicationBoardDialog = new SingletonModal<ApplicationBoardModalOpenProps>()
export const GasSettingDialog = new SingletonModal<GasSettingModalOpenOrCloseProps, GasSettingModalOpenOrCloseProps>()
export const TransactionSnackbar = new SingletonModal<TransactionSnackbarOpenProps>()

export const Modals = memo(function Modals() {
    return (
        <>
            <ConnectWalletModal ref={ConnectWalletDialog.register} />
            <WalletConnectQRCodeModal ref={WalletConnectQRCodeDialog.register} />
            <SelectProviderModal ref={SelectProviderDialog.register} />
            <WalletStatusModal ref={WalletStatusDialog.register} />
            <WalletRiskWarningModal ref={WalletRiskWarningDialog.register} />
            <LeavePageConfirmModal ref={LeavePageConfirmDialog.register} />
            <ApplicationBoardModal ref={ApplicationBoardDialog.register} />
            <GasSettingModal ref={GasSettingDialog.register} />
            <TransactionSnackbarModal pluginID={NetworkPluginID.PLUGIN_EVM} ref={TransactionSnackbar.register} />
        </>
    )
})
