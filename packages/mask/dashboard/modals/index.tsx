import { memo } from 'react'

import { ConfirmDialog } from './ConfirmModal/index.js'
import { BackupPreviewModal } from './BackupPreviewModal/index.js'
import { MergeBackupModal } from './MergeBackupModal/index.js'

import * as modals from './modals.js'
import { RestoreBackupModal } from './RestoreBackupModal/index.js'

export const Modals = memo(function Modals() {
    return (
        <>
            <ConfirmDialog ref={modals.ConfirmDialog.register} />
            <BackupPreviewModal ref={modals.BackupPreviewModal.register} />
            <MergeBackupModal ref={modals.MergeBackupModal.register} />
            <RestoreBackupModal ref={modals.RestoreBackupModal.register} />
        </>
    )
})
