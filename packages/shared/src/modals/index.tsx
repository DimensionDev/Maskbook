import { SingletonModal } from '@masknet/shared-base'
import { WalletConnectQRCode, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'
import { SelectProviderModal, type SelectProviderDialogOpenProps } from './SelectProviderDialog/index.js'
import { WalletStatusModal, type WalletStatusModalOpenProps } from './WalletStatusDialog/index.js'
import { WalletRiskWarningModal, type WalletRiskWarningModalOpenProps } from './WalletRiskWarningDialog/index.js'

export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>().bind()
export const SelectProviderDialog = new SingletonModal<SelectProviderDialogOpenProps>().bind()
export const WalletStatusDialog = new SingletonModal<WalletStatusModalOpenProps>().bind()
export const WalletRiskWarningDialog = new SingletonModal<WalletRiskWarningModalOpenProps>().bind()

export function Modals() {
    return (
        <>
            <WalletConnectQRCode ref={WalletConnectQRCodeDialog.register} />
            <SelectProviderModal ref={SelectProviderDialog.register} />
            <WalletStatusModal ref={WalletStatusDialog.register} />
            <WalletRiskWarningModal ref={WalletRiskWarningDialog.register} />
        </>
    )
}
