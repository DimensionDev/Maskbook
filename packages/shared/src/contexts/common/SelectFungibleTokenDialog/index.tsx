import { useContext } from 'react'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { ContextOptions, createUITaskManager } from '../../UITaskManager'
import { SelectFungibleTokenDialogProps, SelectFungibleTokenDialog } from '../../components/SelectFungibleTokenDialog'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const { TaskManagerContext, TaskManagerProvider: SelectFungibleTokenProvider } = createUITaskManager<
    Web3Helper.FungibleTokenScope<'all'> | null,
    SelectFungibleTokenDialogProps,
    Omit<SelectFungibleTokenDialogProps, 'open' | 'onClose'>
>(SelectFungibleTokenDialog)

export function useSelectFungibleToken<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const context = useContext(TaskManagerContext) as ContextOptions<
        Omit<SelectFungibleTokenDialogProps, 'open' | 'onClose'>,
        Web3Helper.FungibleTokenScope<S, T>
    >
    return context.show
}

export { SelectFungibleTokenProvider }
