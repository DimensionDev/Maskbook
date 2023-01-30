import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { DonateDialog, DonateDialogProps } from './DonateDialog.js'

const { TaskManagerContext, TaskManagerProvider: DonateProvider } = createUITaskManager<DonateDialogProps, void>(
    DonateDialog,
)
export const useDonate = () => {
    return useContext(TaskManagerContext).show
}

export { DonateProvider }
