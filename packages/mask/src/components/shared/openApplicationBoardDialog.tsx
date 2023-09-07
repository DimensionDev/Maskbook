import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { ApplicationBoardModal } from '@masknet/shared'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import { usePersonasFromDB } from '../DataSource/usePersonasFromDB.js'
import { usePersonaPerSiteConnectStatus } from '../DataSource/usePersonaPerSiteConnectStatus.js'
import Services from '#services'

export function useOpenApplicationBoardDialog(quickMode?: boolean, focusPluginID?: PluginID) {
    const lastRecognized = useLastRecognizedIdentity()
    const allPersonas = usePersonasFromDB()
    const { value: applicationCurrentStatus, loading: personaPerSiteConnectStatusLoading } =
        usePersonaPerSiteConnectStatus()

    return useCallback(
        () =>
            ApplicationBoardModal.open({
                allPersonas,
                lastRecognized,
                openDashboard: Services.Helper.openDashboard,
                currentSite: activatedSiteAdaptorUI!.networkIdentifier,
                queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
                setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
                getDecentralizedSearchSettings: Services.Settings.getDecentralizedSearchSettings,
                setDecentralizedSearchSettings: Services.Settings.setDecentralizedSearchSettings,
                personaPerSiteConnectStatusLoading,
                applicationCurrentStatus,
                quickMode,
                focusPluginID,
            }),
        [
            allPersonas,
            lastRecognized,
            applicationCurrentStatus,
            currentSite,
            personaPerSiteConnectStatusLoading,
            quickMode,
            focusPluginID,
        ],
    )
}
