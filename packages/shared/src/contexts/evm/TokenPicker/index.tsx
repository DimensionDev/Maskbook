import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useContext } from 'react'
import { createUITaskManager } from '../../UITaskManager'
import { PickTokenOptions, SelectTokenDialog, SelectTokenDialogProps } from './SelectTokenDialog'

const { TaskManagerContext, TaskManagerProvider: TokenPickerProvider } = createUITaskManager<
    PickTokenOptions,
    FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    SelectTokenDialogProps
>(SelectTokenDialog)

export const usePickToken = () => {
    return useContext(TaskManagerContext).show
}
export { TokenPickerProvider }
