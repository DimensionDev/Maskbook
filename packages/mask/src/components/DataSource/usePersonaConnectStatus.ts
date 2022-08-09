import { useMemo } from 'react'
import stringify from 'json-stable-stringify'
import { DashboardRoutes, isSamePersona, isSameProfile } from '@masknet/shared-base'
import Services from '../../extension/service'
import { currentPersonaIdentifier, currentSetupGuideStatus } from '../../../shared/legacy-settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../../../shared/legacy-settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { usePersonasFromDB } from './usePersonasFromDB'
import { useValueRef } from '@masknet/shared-base-ui'

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

/**
 * @deprecated Should use useCurrentPersonaConnectStatus
 * We are fixing the current persona logic on SNS
 */
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

export function useCurrentPersonaConnectStatus() {
    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    return useMemo(() => {
        const currentPersona = personas.find((x) => isSamePersona(x, currentIdentifier))
        const currentProfile = currentPersona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, lastRecognized.identifier),
        )

        return {
            action: !personas.length ? createPersona : !currentProfile ? connectPersona : undefined,
            currentPersona,
            connected: !!currentProfile,
            hasPersona: !!personas.length,
        }
    }, [currentIdentifier, personas, lastRecognized.identifier?.toText(), activatedSocialNetworkUI])
}
