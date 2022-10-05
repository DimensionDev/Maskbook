import { useContext } from 'react'
import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import { SelectGasSettingsDialogProps, SelectGasSettingsDialog } from '../../components/SelectGasSettingsDialog.js'

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
