import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager.js'
import { ConfirmDialog, ConfirmDialogProps } from './Dialog.js'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<ConfirmDialogProps, boolean>(
    ConfirmDialog,
)

export const useShowConfirm = () => {
    return useContext(TaskManagerContext).show
}
export { ConfirmProvider }
