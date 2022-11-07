import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { TipsTransaction, TipsTransactionProps } from '../components/TipsTransaction/index.js'

const { TaskManagerContext, TaskManagerProvider: TipsTransactionProvider } = createUITaskManager<
    TipsTransactionProps,
    void
>(TipsTransaction)

export const useCreateTipsTransaction = () => {
    return useContext(TaskManagerContext).show
}

export { TipsTransactionProvider }
