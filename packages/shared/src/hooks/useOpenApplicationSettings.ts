import { useSiteAdaptorContext } from '@masknet/plugin-infra/dom'
import { ApplicationBoardSettingsModal } from '../index.js'
import { useCallback } from 'react'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'

export function useOpenApplicationSettings() {
    const { setPluginMinimalModeEnabled, getDecentralizedSearchSettings, setDecentralizedSearchSettings } =
        useSiteAdaptorContext()

    return useCallback(
        (tab?: ApplicationSettingTabs) => {
            ApplicationBoardSettingsModal.open({
                setPluginMinimalModeEnabled,
                getDecentralizedSearchSettings,
                setDecentralizedSearchSettings,
                tab,
            })
        },
        [setPluginMinimalModeEnabled, getDecentralizedSearchSettings, setDecentralizedSearchSettings],
    )
}
