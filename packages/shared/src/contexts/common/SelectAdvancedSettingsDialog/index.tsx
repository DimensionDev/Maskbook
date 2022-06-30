import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { ContextOptions, createUITaskManager } from '../../UITaskManager'
import { SelectGasSettingsDialogProps, SelectGasSettingsDialog } from '../../components/SelectGasSettingsDialog'

interface AdvancedSettings<T extends NetworkPluginID = NetworkPluginID> {
    slippageTolerance?: number
    transaction?: Web3Helper.Definition[T]['Transaction']
}

const { TaskManagerContext, TaskManagerProvider: SelectGasSettingsProvider } = createUITaskManager<
    SelectGasSettingsDialogProps,
    AdvancedSettings
>(SelectGasSettingsDialog)

export function useSelectAdvancedSettings<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const context = useContext(TaskManagerContext) as ContextOptions<SelectGasSettingsDialogProps, AdvancedSettings<T>>
    return context.show
}

export { SelectGasSettingsProvider }
