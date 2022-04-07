import { DashboardRoutes, ProfileIdentifier } from '@masknet/shared-base'
import stringify from 'json-stable-stringify'
import { useMemo } from 'react'
import type { Persona } from '../../database'
import Services from '../../extension/service'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useMyPersonas } from './useMyPersonas'

const createPersona = () => {
    Services.Welcome.openOptionsPage(DashboardRoutes.Setup)
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
        const id = new ProfileIdentifier(activatedSocialNetworkUI.networkIdentifier, lastRecognized.identifier.userId)
        let connected = false
        let currentConnectedPersona: Persona | undefined
        personas.forEach((p) => {
            if (!p.linkedProfiles.get(id)) return
            connected = true
            currentConnectedPersona = p
        })
        const action = !personas.length ? createPersona : !connected ? connectPersona : null
        return { connected, action, hasPersona: !!personas.length, currentConnectedPersona }
    }, [personas, lastRecognized, activatedSocialNetworkUI])
}
