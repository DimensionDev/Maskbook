import { useMemo } from 'react'
import stringify from 'json-stable-stringify'
import { DashboardRoutes } from '@masknet/shared-base'
import Services from '../../extension/service'
import { currentSetupGuideStatus } from '../../settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../InjectedComponents/SetupGuide/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { usePersonasFromDB } from './usePersonasFromDB'

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
    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()

    return useMemo(() => {
        const id = lastRecognized.identifier
        const currentPersona = personas.find((x) => id && x.linkedProfiles.some((x) => x.identifier === id))
        return {
            action: !personas.length ? createPersona : !currentPersona ? connectPersona : undefined,
            currentPersona,
            connected: !!currentPersona,
            hasPersona: !!personas.length,
        }
    }, [personas, lastRecognized.identifier?.toText(), activatedSocialNetworkUI])
}
