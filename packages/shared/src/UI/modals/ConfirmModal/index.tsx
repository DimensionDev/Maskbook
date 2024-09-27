import { useState } from 'react'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { Confirm } from './Dialog.js'
import type { InjectedDialogProps } from '../../contexts/index.js'

export interface ConfirmModalOpenProps extends Omit<InjectedDialogProps, 'onSubmit' | 'content' | 'open'> {
    confirmLabel?: React.ReactNode | string
    content: React.ReactNode | string
    maxWidthOfContent?: number
}

export type ConfirmModalCloseProps = boolean

export function ConfirmModal({ ref }: SingletonModalProps<ConfirmModalOpenProps, ConfirmModalCloseProps>) {
    const [props_, setProps_] = useState<ConfirmModalOpenProps>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps_(props)
        },
    })

    if (!open) return null
    return (
        <Confirm
            open
            onSubmit={() => dispatch?.close(true)}
            onClose={() => dispatch?.close(false)}
            {...props_}
            content={props_?.content}
        />
    )
}
