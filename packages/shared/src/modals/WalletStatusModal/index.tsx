import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { WalletStatusDialog } from './WalletStatusDialog.js'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'

export type WalletStatusModalOpenProps = void

export interface WalletStatusModalProps {}

export const WalletStatusModal = forwardRef<SingletonModalRefCreator, WalletStatusModalProps>((props, ref) => {
    const [isHidden, setHidden] = useState(false)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setHidden(false)
        },
    })

    if (!open) return null
    return <WalletStatusDialog open setHidden={setHidden} onClose={() => dispatch?.close()} isHidden={isHidden} />
})
