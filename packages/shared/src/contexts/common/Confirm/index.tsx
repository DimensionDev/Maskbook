import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager'
import { ConfirmDialog, ConfirmDialogProps } from './Dialog'
import type { ConfirmOptions } from './types'

const { TaskManagerContext, TaskManagerProvider: ConfirmProvider } = createUITaskManager<
    ConfirmOptions,
    void,
    ConfirmDialogProps,
    'onConfirm'
>(ConfirmDialog, 'onConfirm')

export const useShowConfirm = () => {
    return useContext(TaskManagerContext).show
}
export { ConfirmProvider }
