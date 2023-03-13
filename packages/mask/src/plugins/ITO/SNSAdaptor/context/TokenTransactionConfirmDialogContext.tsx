import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { TransactionConfirmDialog, type TransactionConfirmDialogProps } from './TokenTransactionConfirmDialog.js'

const { TaskManagerContext, TaskManagerProvider: TransactionConfirmDialogProvider } = createUITaskManager<
    TransactionConfirmDialogProps,
    void
>(TransactionConfirmDialog)

export const useTransactionConfirmDialog = () => {
    return useContext(TaskManagerContext).show
}

export { TransactionConfirmDialogProvider }
