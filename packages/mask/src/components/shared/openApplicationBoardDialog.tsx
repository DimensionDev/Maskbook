import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { ApplicationBoardModal } from '@masknet/shared'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { getCurrentSNSNetwork } from '../../site-adaptors/utils.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import { usePersonasFromDB } from '../DataSource/usePersonasFromDB.js'
import { usePersonaAgainstSNSConnectStatus } from '../DataSource/usePersonaAgainstSNSConnectStatus.js'
import Services from '../../extension/service.js'

export function useOpenApplicationBoardDialog(quickMode?: boolean, focusPluginID?: PluginID) {
    const lastRecognized = useLastRecognizedIdentity()
    const allPersonas = usePersonasFromDB()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSiteAdaptorUI.networkIdentifier)
    const { value: applicationCurrentStatus, loading: personaAgainstSNSConnectStatusLoading } =
        usePersonaAgainstSNSConnectStatus()

    return useCallback(
        () =>
            ApplicationBoardModal.open({
                allPersonas,
                lastRecognized,
                openDashboard: Services.Helper.openDashboard,
                currentSNSNetwork,
                queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
                setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
                getDecentralizedSearchSettings: Services.Settings.getDecentralizedSearchSettings,
                setDecentralizedSearchSettings: Services.Settings.setDecentralizedSearchSettings,
                personaAgainstSNSConnectStatusLoading,
                applicationCurrentStatus,
                quickMode,
                focusPluginID,
            }),
        [
            allPersonas,
            lastRecognized,
            applicationCurrentStatus,
            currentSNSNetwork,
            personaAgainstSNSConnectStatusLoading,
            quickMode,
            focusPluginID,
        ],
    )
}
