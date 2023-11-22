import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'
import { ApplicationBoardSettingsModal } from '../index.js'

export function useOpenApplicationSettings() {
    const context = useSiteAdaptorContext()

    return useCallback(
        (tab?: ApplicationSettingTabs, focusPluginID?: PluginID) => {
            ApplicationBoardSettingsModal.open({
                setPluginMinimalModeEnabled: context?.setPluginMinimalModeEnabled,
                tab,
                focusPluginID,
            })
        },
        [context?.setPluginMinimalModeEnabled],
    )
}
