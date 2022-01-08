import { DashboardRoutes, ProfileIdentifier } from '@masknet/shared-base'
import stringify from 'json-stable-stringify'
import { useMemo } from 'react'
import Services from '../../extension/service'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide'
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
        personas.forEach((p) => {
            p.identifier
            if (p.linkedProfiles.get(id)) {
                connected = true
            }
        })
        const action = !personas.length ? createPersona : !connected ? connectPersona : null
        return { connected, action, hasPersona: !!personas.length }
    }, [personas, lastRecognized, activatedSocialNetworkUI])
}
