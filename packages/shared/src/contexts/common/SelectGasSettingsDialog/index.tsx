import { useContext } from 'react'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { ContextOptions, createUITaskManager } from '../../UITaskManager'
import { SelectGasSettingsDialogProps, SelectGasSettingsDialog } from '../../components/SelectGasSettingsDialog'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const { TaskManagerContext, TaskManagerProvider: SelectGasSettingsProvider } = createUITaskManager<
    Web3Helper.FungibleTokenScope<'all'> | null,
    SelectGasSettingsDialogProps,
    Omit<SelectGasSettingsDialogProps, 'open' | 'onClose'>
>(SelectGasSettingsDialog)

export function useSelectGasSettings<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
    const context = useContext(TaskManagerContext) as ContextOptions<
        Omit<SelectGasSettingsDialogProps, 'open' | 'onClose'>,
        Web3Helper.FungibleTokenScope<S, T>
    >
    return context.show
}

export { SelectGasSettingsProvider }
