import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { RenameDialog, type RenameDialogProps } from './RenameDialog.js'

const { TaskManagerContext, TaskManagerProvider: RenameProvider } = createUITaskManager<RenameDialogProps, string>(
    RenameDialog,
)
export const useShowRenameDialog = () => {
    return useContext(TaskManagerContext).show
}

export { RenameProvider }
