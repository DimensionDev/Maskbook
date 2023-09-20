import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import { ApplicationBoardSettingsModal } from '../index.js'
import { useCallback } from 'react'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'
import type { PluginID } from '@masknet/shared-base'

export function useOpenApplicationSettings() {
    const { setPluginMinimalModeEnabled, getDecentralizedSearchSettings, setDecentralizedSearchSettings } =
        useSiteAdaptorContext()

    return useCallback(
        (tab?: ApplicationSettingTabs, focusPluginID?: PluginID) => {
            ApplicationBoardSettingsModal.open({
                setPluginMinimalModeEnabled,
                getDecentralizedSearchSettings,
                setDecentralizedSearchSettings,
                tab,
                focusPluginID,
            })
        },
        [setPluginMinimalModeEnabled, getDecentralizedSearchSettings, setDecentralizedSearchSettings],
    )
}
