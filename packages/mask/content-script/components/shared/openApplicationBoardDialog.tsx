import { useCallback } from 'react'
import type { PluginID } from '@masknet/shared-base'
import { ApplicationBoardModal } from '@masknet/shared'
import { useMyIdentity } from '../DataSource/useActivatedUI.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/ui.js'
import { usePersonasFromDB } from '../../../shared-ui/hooks/usePersonasFromDB.js'
import { usePersonaPerSiteConnectStatus } from '../DataSource/usePersonaPerSiteConnectStatus.js'
import Services from '#services'

export function useOpenApplicationBoardDialog(quickMode?: boolean, focusPluginID?: PluginID) {
    const myIdentity = useMyIdentity()
    const allPersonas = usePersonasFromDB()
    const { value: applicationCurrentStatus, loading: personaPerSiteConnectStatusLoading } =
        usePersonaPerSiteConnectStatus()

    return useCallback(
        () =>
            ApplicationBoardModal.open({
                allPersonas,
                myIdentity,
                openDashboard: Services.Helper.openDashboard,
                currentSite: activatedSiteAdaptorUI!.networkIdentifier,
                queryOwnedPersonaInformation: Services.Identity.queryOwnedPersonaInformation,
                setPluginMinimalModeEnabled: Services.Settings.setPluginMinimalModeEnabled,
                personaPerSiteConnectStatusLoading,
                applicationCurrentStatus,
                quickMode,
                focusPluginID,
            }),
        [
            allPersonas,
            myIdentity,
            applicationCurrentStatus,
            personaPerSiteConnectStatusLoading,
            quickMode,
            focusPluginID,
        ],
    )
}
