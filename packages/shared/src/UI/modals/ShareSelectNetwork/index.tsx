import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { forwardRef, useState } from 'react'
import { ShareSelectNetwork } from './ShareModal.js'

export interface ShareSelectNetworkModalOpenProps {
    message: Uint8Array
}

export const ShareSelectNetworkModal = forwardRef<SingletonModalRefCreator<ShareSelectNetworkModalOpenProps>>(
    (props, ref) => {
        const [message, setMessage] = useState<null | Uint8Array>(null)

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setMessage(props.message)
            },
        })

        if (!open) return null
        if (!message) return null
        return <ShareSelectNetwork open onClose={() => dispatch?.close()} message={message} />
    },
)
