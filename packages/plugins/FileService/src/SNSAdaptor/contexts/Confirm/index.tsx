import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog.js'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<ConfirmDialogProps, boolean>(
    ConfirmDialog,
)
export const useShowConfirm = () => {
    return useContext(TaskManagerContext).show
}

export { ConfirmProvider }
