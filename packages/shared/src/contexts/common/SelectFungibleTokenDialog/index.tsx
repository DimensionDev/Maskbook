import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import { type SelectFungibleTokenDialogProps, SelectFungibleTokenDialog } from '../../components/index.js'

const { TaskManagerContext, TaskManagerProvider: SelectFungibleTokenProvider } = createUITaskManager<
    SelectFungibleTokenDialogProps,
    Web3Helper.FungibleTokenAll | null
>(SelectFungibleTokenDialog)

export function useSelectFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>() {
    const context = useContext(TaskManagerContext) as ContextOptions<
        SelectFungibleTokenDialogProps,
        Web3Helper.FungibleTokenScope<S, T>
    >
    return context.show
}

export { SelectFungibleTokenProvider }
