import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { ContextOptions, createUITaskManager } from '../../UITaskManager'
import { SelectFungibleTokenDialogProps, SelectFungibleTokenDialog } from '../../components/SelectFungibleTokenDialog'

const { TaskManagerContext, TaskManagerProvider: SelectFungibleTokenProvider } = createUITaskManager<
    SelectFungibleTokenDialogProps,
    Web3Helper.FungibleTokenScope<'all'> | null
>(SelectFungibleTokenDialog)

export function useSelectFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const context = useContext(TaskManagerContext) as ContextOptions<
        SelectFungibleTokenDialogProps,
        Web3Helper.FungibleTokenScope<S, T>
    >
    return context.show
}

export { SelectFungibleTokenProvider }
