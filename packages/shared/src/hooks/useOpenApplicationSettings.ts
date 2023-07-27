import { useSNSAdaptorContext } from '@masknet/plugin-infra/dom'
import { ApplicationBoardSettingsModal } from '../index.js'
import { useCallback } from 'react'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'

export function useOpenApplicationSettings() {
    const { setPluginMinimalModeEnabled, getDecentralizedSearchSettings, setDecentralizedSearchSettings } =
        useSNSAdaptorContext()

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
