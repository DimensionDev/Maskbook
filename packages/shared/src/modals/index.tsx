import { memo } from 'react'
import { SingletonModal } from '@masknet/shared-base'
import { SelectProviderModal, type SelectProviderDialogOpenProps } from './SelectProviderDialog/index.js'
import { WalletConnectQRCodeModal, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'
import { WalletRiskWarningModal, type WalletRiskWarningModalOpenProps } from './WalletRiskWarningDialog/index.js'
import { ConnectWalletModal, type ConnectWalletDialogOpenProps } from './ConnectWalletDialog/index.js'
import { WalletStatusModal, type WalletStatusModalOpenProps } from './WalletStatusDialog/index.js'
import { LeavePageConfirmModal, type LeavePageConfirmDialogOpenProps } from './LeavePageConfirmDialog/index.js'
import { TransactionModal, type TransactionSnackbarOpenProps } from './TransactionSnackbar/index.js'

export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderDialog = new SingletonModal<SelectProviderDialogOpenProps>()
export const WalletStatusDialog = new SingletonModal<WalletStatusModalOpenProps>()
export const WalletRiskWarningDialog = new SingletonModal<WalletRiskWarningModalOpenProps>()
export const ConnectWalletDialog = new SingletonModal<ConnectWalletDialogOpenProps>()
export const LeavePageConfirmDialog = new SingletonModal<LeavePageConfirmDialogOpenProps>()
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
            <TransactionModal ref={TransactionSnackbar.register} />
        </>
    )
})
