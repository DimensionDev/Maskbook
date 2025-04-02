import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useState } from 'react'
import { BackupPreviewDialog, type BackupPreviewDialogProps } from './BackupPreviewDialog.js'

export interface BackupPreviewModalOpenProps extends Omit<BackupPreviewDialogProps, 'open' | 'onClose'> {}

export function BackupPreviewModal({ ref }: SingletonModalProps<BackupPreviewModalOpenProps>) {
    const [props, setProps] = useState<BackupPreviewModalOpenProps | null>(null)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setProps(props)
        },
        onClose() {
            setProps(null)
        },
    })

    if (!props || !open) return null
    return <BackupPreviewDialog open onClose={() => dispatch?.close()} {...props} />
}
