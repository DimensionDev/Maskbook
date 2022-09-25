import { useContext } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { ContextOptions, createUITaskManager } from '../../UITaskManager.js'
import {
    SelectGasSettingsMenuProps,
    SelectGasSettingsMenu,
    SelectGasSettingsMenuResult,
} from '../../components/SelectGasSettingsMenu.js'

const { TaskManagerContext, TaskManagerProvider: GasSettingsMenuProvider } = createUITaskManager<
    SelectGasSettingsMenuProps,
    SelectGasSettingsMenuResult
>((props: SelectGasSettingsMenuProps) => <SelectGasSettingsMenu {...props} />)

export function useGasSettingsMenu<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const context = useContext(TaskManagerContext) as ContextOptions<
        SelectGasSettingsMenuProps,
        SelectGasSettingsMenuResult
    >
    return context.show
}

export { GasSettingsMenuProvider }
