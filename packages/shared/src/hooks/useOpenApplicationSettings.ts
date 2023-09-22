import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'
import { ApplicationBoardSettingsModal } from '../index.js'

export function useOpenApplicationSettings() {
    const { setPluginMinimalModeEnabled } = useSiteAdaptorContext()

    return useCallback(
        (tab?: ApplicationSettingTabs, focusPluginID?: PluginID) => {
            ApplicationBoardSettingsModal.open({
                setPluginMinimalModeEnabled,
                tab,
                focusPluginID,
            })
        },
        [setPluginMinimalModeEnabled],
    )
}
