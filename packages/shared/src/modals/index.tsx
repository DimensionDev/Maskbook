import { SingletonModal } from '@masknet/shared-base'
import { memo } from 'react'
import { SelectProviderModal, type SelectProviderDialogOpenProps } from './SelectProviderDialog/index.js'
import { WalletConnectQRCode, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'
import { WalletRiskWarningModal, type WalletRiskWarningModalOpenProps } from './WalletRiskWarningDialog/index.js'
import { WalletStatusModal, type WalletStatusModalOpenProps } from './WalletStatusDialog/index.js'

export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderDialog = new SingletonModal<SelectProviderDialogOpenProps>()
export const WalletStatusDialog = new SingletonModal<WalletStatusModalOpenProps>()
export const WalletRiskWarningDialog = new SingletonModal<WalletRiskWarningModalOpenProps>()

export const Modals = memo(function Modals() {
    return (
        <>
            <WalletConnectQRCode ref={WalletConnectQRCodeDialog.register} />
            <SelectProviderModal ref={SelectProviderDialog.register} />
            <WalletStatusModal ref={WalletStatusDialog.register} />
            <WalletRiskWarningModal ref={WalletRiskWarningDialog.register} />
        </>
    )
})
