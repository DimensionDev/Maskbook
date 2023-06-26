import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal, type InjectedDialogProps } from '@masknet/shared'
import { RenameDialog } from './RenameDialog.js'

export interface RenameModalOpenProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'open'> {
    title?: string
    currentName?: string
    message?: React.ReactNode | string
    description?: React.ReactNode | string
    onSubmit?(result: string | null): void
}

export interface RenameModalCloseProps {
    name?: string
}

export interface RenameModalProps {}

export const RenameModal = forwardRef<
    SingletonModalRefCreator<RenameModalOpenProps, RenameModalCloseProps>,
    RenameModalProps
>((props, ref) => {
    const [props_, setProps_] = useState<RenameModalOpenProps>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps_(props)
        },
    })

    if (!open) return null
    return (
        <RenameDialog
            open
            onClose={(name) => dispatch?.close({ name })}
            {...props_}
            currentName={props_?.currentName ?? ''}
        />
    )
})
