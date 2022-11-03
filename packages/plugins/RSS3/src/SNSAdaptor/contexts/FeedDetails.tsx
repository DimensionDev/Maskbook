import { createUITaskManager } from '@masknet/shared'
import { useContext } from 'react'
import { FeedDetailsDialog, FeedDetailsDialogProps } from '../components/DetailsDialog/index.js'

const { TaskManagerContext, TaskManagerProvider: FeedDetailsProvider } = createUITaskManager<
    FeedDetailsDialogProps,
    void
>(FeedDetailsDialog)

export const useViewFeedDetails = () => {
    return useContext(TaskManagerContext).show
}

export { FeedDetailsProvider }
