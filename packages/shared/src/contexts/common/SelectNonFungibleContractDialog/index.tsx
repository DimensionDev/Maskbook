import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import { type SelectNonFungibleContractDialogProps, SelectNonFungibleContractDialog } from '../../components/index.js'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'

const { TaskManagerContext, TaskManagerProvider: SelectNonFungibleContractProvider } = createUITaskManager<
    SelectNonFungibleContractDialogProps,
    NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
>(SelectNonFungibleContractDialog)

export function useSelectNonFungibleContract<T extends NetworkPluginID = NetworkPluginID>() {
    const context = useContext(TaskManagerContext) as ContextOptions<
        SelectNonFungibleContractDialogProps,
        NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >
    return context.show
}

export { SelectNonFungibleContractProvider }
