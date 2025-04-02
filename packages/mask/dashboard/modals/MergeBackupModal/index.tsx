import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { MergeBackupDialog, type MergeBackupDialogProps } from './MergeBackupDialog.js'

export interface MergeBackupModalOpenProps extends Omit<MergeBackupDialogProps, 'open' | 'onClose'> {}

export function MergeBackupModal({ ref }: SingletonModalProps<MergeBackupModalOpenProps>) {
    const [props, setProps] = useState<MergeBackupModalOpenProps | null>(null)
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps(props)
        },
        onClose(props) {
            setProps(null)
        },
    })
    if (!props) return null

    return <MergeBackupDialog open={open} onClose={() => dispatch?.close()} {...props} />
}
