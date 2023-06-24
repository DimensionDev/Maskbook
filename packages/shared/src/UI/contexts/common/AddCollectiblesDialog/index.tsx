import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import { type AddCollectiblesDialogProps, AddCollectiblesDialog } from '../../components/index.js'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'

const { TaskManagerContext, TaskManagerProvider: AddCollectiblesProvider } = createUITaskManager<
    AddCollectiblesDialogProps,
    [contract: NonFungibleTokenContract<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>, tokenIds: string[]]
>(AddCollectiblesDialog)

export function useAddCollectibles<T extends NetworkPluginID = NetworkPluginID>() {
    const context = useContext(TaskManagerContext) as ContextOptions<
        AddCollectiblesDialogProps,
        [
            contract: NonFungibleTokenContract<
                Web3Helper.Definition[T]['ChainId'],
                Web3Helper.Definition[T]['SchemaType']
            >,
            tokenIds: string[],
        ]
    >
    return context.show
}

export { AddCollectiblesProvider }
