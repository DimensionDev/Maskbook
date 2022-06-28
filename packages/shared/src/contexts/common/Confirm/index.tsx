import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager'
import { ConfirmDialog, ConfirmDialogProps } from './Dialog'
import type { ConfirmOptions } from './types'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<
    boolean,
    ConfirmDialogProps,
    ConfirmOptions
>(ConfirmDialog)

export const useShowConfirm = () => {
    return useContext(TaskManagerContext).show
}
export { ConfirmProvider }
