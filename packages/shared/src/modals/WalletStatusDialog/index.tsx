import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { WalletStatus } from './WalletStatus.js'
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
    return <WalletStatus open setHidden={setHidden} onClose={() => dispatch?.close()} isHidden={isHidden} />
})
