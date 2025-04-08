import { SingletonModal } from '@masknet/shared-base'
import type { ConfirmDialogOpenProps } from './ConfirmModal/index.js'
import type { BackupPreviewModalOpenProps } from './BackupPreviewModal/index.js'
import type { RestoreBackupModalCloseResult, RestoreBackupModalOpenProps } from './RestoreBackupModal/index.js'

export const ConfirmDialog = new SingletonModal<ConfirmDialogOpenProps, boolean>()
export const BackupPreviewModal = new SingletonModal<BackupPreviewModalOpenProps>()
export const RestoreBackupModal = new SingletonModal<RestoreBackupModalOpenProps, RestoreBackupModalCloseResult>()
