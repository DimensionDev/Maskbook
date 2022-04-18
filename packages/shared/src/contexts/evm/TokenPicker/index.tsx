import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager'
import { PickTokenOptions, SelectTokenDialog, SelectTokenDialogProps } from './SelectTokenDialog'

const { TaskManagerContext, TaskManagerProvider: TokenPickerProvider } = createUITaskManager<
    PickTokenOptions,
    FungibleTokenDetailed,
    SelectTokenDialogProps,
    'onSelect'
>(SelectTokenDialog, 'onSelect')

export const usePickToken = () => {
    return useContext(TaskManagerContext).show
}
export { TokenPickerProvider }
