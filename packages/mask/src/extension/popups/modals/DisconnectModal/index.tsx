import { forwardRef, useState, type ReactNode } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { DisconnectDialog } from './DisconnectDialog.js'

export interface DisconnectModalOpenProps {
    onSubmit: () => Promise<void>
    title: string
    tips: ReactNode
}

export interface DisconnectModalProps {}

export const DisconnectModal = forwardRef<SingletonModalRefCreator<DisconnectModalOpenProps>, DisconnectModalProps>(
    (props, ref) => {
        const [onSubmit, setOnSubmit] = useState<() => Promise<void>>()
        const [title, setTitle] = useState('')
        const [tips, setTips] = useState<ReactNode>()
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setOnSubmit(() => props.onSubmit)
                setTips(props.tips)
                setTitle(props.title)
            },
        })

        return (
            <DisconnectDialog
                open={open}
                onClose={() => dispatch?.close()}
                onSubmit={onSubmit}
                title={title}
                tips={tips}
            />
        )
    },
)
