import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal, type InjectedDialogProps } from '@masknet/shared'
import { ConfirmDialog } from './ConfirmDialog.js'

export interface ConfirmModalOpenProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'content' | 'open'> {
    title?: string
    message?: React.ReactNode | string
    description?: React.ReactNode | string
    confirmLabel?: string
    onSubmit?(result: boolean | null): void
}

export interface ConfirmModalProps {}

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps>, ConfirmModalProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<ConfirmModalOpenProps>()
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
            },
        })

        if (!open) return null
        return <ConfirmDialog open onClose={() => dispatch?.close()} {...props_} message={props_?.message} />
    },
)
