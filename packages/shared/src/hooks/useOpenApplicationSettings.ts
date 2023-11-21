import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { setPluginMinimalModeEnabled } from '@masknet/plugin-infra/dom/context'
import type { ApplicationSettingTabs } from '../UI/modals/ApplicationBoardModal/ApplicationBoardDialog.js'
import { ApplicationBoardSettingsModal } from '../UI/modals/modals.js'

export function useOpenApplicationSettings() {
    return useCallback((tab?: ApplicationSettingTabs, focusPluginID?: PluginID) => {
        ApplicationBoardSettingsModal.open({
            setPluginMinimalModeEnabled,
            tab,
            focusPluginID,
        })
    }, [])
}
