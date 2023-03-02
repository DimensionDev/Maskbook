import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { ResultModal, type ResultModalProps } from './Modal.js'

const { TaskManagerContext, TaskManagerProvider: ResultModalProvider } = createUITaskManager<ResultModalProps, void>(
    ResultModal,
)

export const useShowResult = () => useContext(TaskManagerContext).show

export { ResultModalProvider }
