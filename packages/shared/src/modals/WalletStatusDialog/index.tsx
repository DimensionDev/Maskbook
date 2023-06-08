import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { useSingletonModal } from '../../index.js'
import { WalletStatus } from './WalletStatus.js'

export interface WalletStatusModalOpenProps {}

export interface WalletStatusModalProps {}

export const WalletStatusModal = forwardRef<
    SingletonModalRefCreator<WalletStatusModalOpenProps>,
    WalletStatusModalProps
>((props, ref) => {
    const [isHidden, setHidden] = useState(false)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setHidden(false)
        },
    })

    if (!open) return null
    return <WalletStatus open setHidden={setHidden} onClose={() => dispatch?.close()} isHidden={isHidden} />
})
