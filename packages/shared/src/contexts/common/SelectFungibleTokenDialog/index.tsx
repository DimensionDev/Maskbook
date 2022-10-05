import { useContext } from 'react'

import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import {
    SelectFungibleTokenDialogProps,
    SelectFungibleTokenDialog,
} from '../../components/SelectFungibleTokenDialog.js'

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
