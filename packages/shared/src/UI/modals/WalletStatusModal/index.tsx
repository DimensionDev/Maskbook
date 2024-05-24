import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { WalletStatusDialog } from './WalletStatusDialog.js'

export function WalletStatusModal({ ref }: SingletonModalProps) {
    const [isHidden, setHidden] = useState(false)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen() {
            setHidden(false)
        },
    })

    if (!open) return null
    return <WalletStatusDialog open setHidden={setHidden} onClose={() => dispatch?.close()} isHidden={isHidden} />
}
