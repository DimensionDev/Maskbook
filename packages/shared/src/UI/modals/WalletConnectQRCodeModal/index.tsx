import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { QRCodeDialog } from './QRCodeDialog.js'

export interface WalletConnectQRCodeOpenProps {
    uri: string
}

export function WalletConnectQRCodeModal({ ref }: SingletonModalProps<WalletConnectQRCodeOpenProps>) {
    const [uri, setURI] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setURI(props.uri)
        },
    })

    if (!open || !uri) return null
    return <QRCodeDialog uri={uri} open onClose={() => dispatch?.close()} />
}
