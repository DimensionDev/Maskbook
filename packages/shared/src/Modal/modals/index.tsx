import { SingletonModal } from '../libs/SingletonModal.js'
import { Example, type ExampleOpenProps } from './Example/index.js'
import { WalletConnectQRCode, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'
import { SelectProviderModal, type SelectProviderDialogOpenProps } from './SelectProviderDialog/index.js'

export const ExampleDialog = new SingletonModal<ExampleOpenProps>()
export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()
export const SelectProviderDialog = new SingletonModal<SelectProviderDialogOpenProps>()

export function Modals() {
    return (
        <>
            <Example ref={ExampleDialog.register.bind(ExampleDialog)} />
            <WalletConnectQRCode ref={WalletConnectQRCodeDialog.register.bind(WalletConnectQRCodeDialog)} />
            <SelectProviderModal ref={SelectProviderDialog.register.bind(SelectProviderDialog)} />
        </>
    )
}
