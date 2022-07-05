import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager'
import { ConfirmDialog, ConfirmDialogProps } from './Dialog'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<ConfirmDialogProps, boolean>(
    ConfirmDialog,
)

export const useShowConfirm = () => {
    return useContext(TaskManagerContext).show
}
export { ConfirmProvider }
