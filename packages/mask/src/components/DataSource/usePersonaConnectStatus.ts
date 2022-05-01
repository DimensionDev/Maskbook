import { DashboardRoutes, PersonaInformation, NextIDPlatform } from '@masknet/shared-base'
import stringify from 'json-stable-stringify'
import { useAsync } from 'react-use'
import { useMemo, useCallback } from 'react'
import Services from '../../extension/service'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useMyPersonas } from './useMyPersonas'
import { useSetupGuideStatusState } from './useNextID'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext'

const createPersona = () => {
    Services.Helper.openDashboard(DashboardRoutes.Setup)
}

const connectPersona = async () => {
    const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
    currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier].value = stringify({
        status: SetupGuideStep.FindUsername,
        persona: currentPersonaIdentifier?.toText(),
    })
}

export function usePersonaConnectStatus() {
    const personas = useMyPersonas()
    const lastRecognized = useLastRecognizedIdentity()

    return useMemo(() => {
        const id = lastRecognized.identifier
        let connected = false
        let currentConnectedPersona: PersonaInformation | undefined
        personas.forEach((p) => {
            if (!id) return
            if (!p.linkedProfiles.some((x) => x.identifier === id)) return
            connected = true
            currentConnectedPersona = p
        })
        const action = !personas.length ? createPersona : !connected ? connectPersona : null
        return { connected, action, hasPersona: !!personas.length, currentConnectedPersona }
    }, [personas, lastRecognized, activatedSocialNetworkUI])
}

export function usePersonaAgainstSNSConnectStatus() {
    const ui = activatedSocialNetworkUI
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
    const lastState = useSetupGuideStatusState()
    const { currentPersona } = PersonaContext.useContainer()
    const lastRecognized = useLastRecognizedIdentity()
    const username = useMemo(() => {
        return lastState.username || lastRecognized.identifier?.userId
    }, [lastState, lastRecognized])
    const personas = useMyPersonas()

    const checkSNSConnectToCurrentPersona = useCallback((persona: PersonaInformation) => {
        if (!username) return undefined
        return persona.linkedProfiles.some((x) => x.identifier.userId === username)
    }, [])

    return useAsync(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        const currentPersona = (await Services.Identity.queryOwnedPersonaInformation(true)).find(
            (x) => x.identifier === currentPersonaIdentifier,
        )
        const currentSNSConnectedPersona = personas.find(checkSNSConnectToCurrentPersona)
        return {
            isSNSConnectToCurrentPersona: currentPersona ? checkSNSConnectToCurrentPersona(currentPersona) : false,
            currentPersonaPublicKey: currentPersona?.identifier.rawPublicKey,
            currentSNSConnectedPersonaPublicKey: currentSNSConnectedPersona?.identifier.rawPublicKey,
        }
    }, [platform, username, ui, personas, currentPersona])
}
