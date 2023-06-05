import { SingletonModal } from '../libs/SingletonModal.js'
import { Example, type ExampleOpenProps } from './Example/index.js'
import { WalletConnectQRCode, type WalletConnectQRCodeOpenProps } from './WalletConnectQRCodeDialog/index.js'

export const ExampleDialog = new SingletonModal<ExampleOpenProps>()
export const WalletConnectQRCodeDialog = new SingletonModal<WalletConnectQRCodeOpenProps>()

export function Modals() {
    return (
        <>
            <Example ref={ExampleDialog.register.bind(ExampleDialog)} />
            <WalletConnectQRCode ref={WalletConnectQRCodeDialog.register.bind(WalletConnectQRCodeDialog)} />
        </>
    )
}
