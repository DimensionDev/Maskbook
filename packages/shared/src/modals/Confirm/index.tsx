import { type PropsWithChildren, forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { Confirm } from './Dialog.js'
import { useSingletonModal, type InjectedDialogProps } from '../../index.js'

export interface ConfirmDialogOpenProps
    extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'content' | 'open'>,
        PropsWithChildren<{}> {
    title?: string
    confirmLabel?: React.ReactNode | string
    onSubmit?(result: boolean | null): void
    maxWidthOfContent?: number
    cancelText?: React.ReactNode | string
    confirmDisabled?: boolean
    maxWidth?: false | 'sm' | 'xs' | 'md' | 'lg' | 'xl'
}

export type ConfirmDialogProps = {}

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmDialogOpenProps>, ConfirmDialogProps>(
    (props, ref) => {
        const [props_, setProps_] = useState<ConfirmDialogOpenProps | undefined>()
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setProps_(props)
            },
        })

        if (!open) return null
        return <Confirm open onClose={() => dispatch?.close()} {...props_} />
    },
)
