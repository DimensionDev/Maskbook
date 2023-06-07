import { SingletonModal } from '@masknet/shared-base'
import { WalletConnectQRCode, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'
import { SelectProviderModal, type SelectProviderDialogOpenProps } from './SelectProviderDialog/index.js'

export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderDialog = new SingletonModal<SelectProviderDialogOpenProps>()

export function Modals() {
    return (
        <>
            <WalletConnectQRCode ref={WalletConnectQRCodeDialog.register.bind(WalletConnectQRCodeDialog)} />
            <SelectProviderModal ref={SelectProviderDialog.register.bind(SelectProviderDialog)} />
        </>
    )
}
