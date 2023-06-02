import { forwardRef, useState } from 'react'
import { QRCodeDialog } from './QRCodeDialog.js'
import type { SingletonModalRefCreator } from '../../libs/SingletonModal.js'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'

export interface WalletConnectQRCodeOpenProps {
    uri: string
}

export interface WalletConnectQRCodeDialogProps {}

export const WalletConnectQRCode = forwardRef<
    SingletonModalRefCreator<WalletConnectQRCodeOpenProps>,
    WalletConnectQRCodeDialogProps
>((props, ref) => {
    const [uri, setURI] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setURI(props?.uri ?? '')
        },
    })

    if (!open) return null
    return <QRCodeDialog uri={uri} open onClose={() => dispatch?.close()} />
})
