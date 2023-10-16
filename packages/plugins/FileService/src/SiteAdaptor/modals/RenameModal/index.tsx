import { forwardRef, useState } from 'react'
import type { InjectedDialogProps } from '@masknet/shared'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { RenameDialog } from './RenameDialog.js'

export interface RenameModalOpenProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'open'> {
    title?: string
    currentName?: string
    message?: React.ReactNode | string
    description?: React.ReactNode | string
}

export type RenameModalCloseProps = string | void

interface RenameModalProps {}

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
            onSubmit={(name) => dispatch?.close(name)}
            onClose={() => dispatch?.close()}
            {...props_}
            currentName={props_?.currentName ?? ''}
        />
    )
})
