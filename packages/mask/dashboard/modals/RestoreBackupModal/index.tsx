import type { BackupSummary } from '@masknet/backup-format'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { RestoreBackupDialog, type RestoreBackupDialogProps } from './RestoreBackupDialog.js'

export interface RestoreBackupModalOpenProps extends Omit<RestoreBackupDialogProps, 'open' | 'onClose'> {}
export type RestoreBackupModalCloseResult = BackupSummary | undefined

export function RestoreBackupModal({
    ref,
}: SingletonModalProps<RestoreBackupModalOpenProps, RestoreBackupModalCloseResult>) {
    const [props, setProps] = useState<RestoreBackupModalOpenProps | null>(null)
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps(props)
        },
        onClose(props) {
            setProps(null)
        },
    })
    if (!props) return null

    return <RestoreBackupDialog open={open} onClose={(success) => dispatch?.close(success)} {...props} />
}
