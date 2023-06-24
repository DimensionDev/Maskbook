import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import { type SelectGasSettingsDialogProps, SelectGasSettingsDialog } from '../../components/SelectGasSettingsDialog.js'

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
