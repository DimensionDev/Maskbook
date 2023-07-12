import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { QRCodeDialog } from './QRCodeDialog.js'

export interface WalletConnectQRCodeOpenProps {
    uri: string
}

export type WalletConnectQRCodeCloseProps = 'UserRejected' | 'Connected' | 'Disconnected'

export interface WalletConnectQRCodeDialogProps {}

export const WalletConnectQRCodeModal = forwardRef<
    SingletonModalRefCreator<WalletConnectQRCodeOpenProps, WalletConnectQRCodeCloseProps>,
    WalletConnectQRCodeDialogProps
>((props, ref) => {
    const [uri, setURI] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setURI(props.uri)
        },
    })

    if (!open) return null
    return <QRCodeDialog uri={uri} open onClose={() => dispatch?.close('UserRejected')} />
})
