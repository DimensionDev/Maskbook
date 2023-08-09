import { useMemo } from 'react'
import { useAsync } from 'react-use'
import stringify from 'json-stable-stringify'
import {
    DashboardRoutes,
    SetupGuideStep,
    currentPersonaIdentifier,
    currentSetupGuideStatus,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '../../extension/service.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from './useActivatedUI.js'
import { usePersonasFromDB } from './usePersonasFromDB.js'

const createPersona = () => {
    Services.Helper.openDashboard(DashboardRoutes.SignUpPersona)
}

const connectPersona = async () => {
    const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
    currentSetupGuideStatus[activatedSiteAdaptorUI.networkIdentifier].value = stringify({
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
    }, [personas, lastRecognized.identifier?.toText(), activatedSiteAdaptorUI])
}

/**
 * Get current setting persona
 */
export function useCurrentPersona() {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)

    const { value } = useAsync(async () => {
        const identifier = await Services.Settings.getCurrentPersonaIdentifier()

        if (!identifier) return
        return Services.Identity.queryPersona(identifier)
    }, [currentIdentifier])

    return value
}
