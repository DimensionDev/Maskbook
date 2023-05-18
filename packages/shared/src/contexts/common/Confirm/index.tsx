import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager.js'
import { ConfirmDialog, type ConfirmDialogProps } from './Dialog.js'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<ConfirmDialogProps, boolean>(
    ConfirmDialog,
)

export function useShowConfirm() {
    return useContext(TaskManagerContext).show
}
export { ConfirmProvider }
