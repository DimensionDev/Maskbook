import { useMemo } from 'react'
import stringify from 'json-stable-stringify'
import { DashboardRoutes, isSamePersona, isSameProfile } from '@masknet/shared-base'
import Services from '../../extension/service'
import { currentPersonaIdentifier, currentSetupGuideStatus } from '../../../shared/legacy-settings/settings'
import { activatedSocialNetworkUI } from '../../social-network'
import { SetupGuideStep } from '../../../shared/legacy-settings/types'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { usePersonasFromDB } from './usePersonasFromDB'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { useAsync } from 'react-use'
import { PluginNextIDMessages } from '../../plugins/NextID/messages'

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

export function useCurrentPersonaConnectStatus() {
    const personas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { setDialog: setPersonaListDialog } = useRemoteControlledDialog(PluginNextIDMessages.PersonaListDialogUpdated)

    return useMemo(() => {
        const currentPersona = personas.find((x) => isSamePersona(x, currentIdentifier))
        const currentProfile = currentPersona?.linkedProfiles.find((x) =>
            isSameProfile(x.identifier, lastRecognized.identifier),
        )

        const action = !personas.length
            ? createPersona
            : !currentProfile
            ? (target?: string, position?: 'center' | 'top-right') =>
                  setPersonaListDialog({ open: true, target, position })
            : undefined

        return {
            action,
            currentPersona,
            connected: !!currentProfile,
            hasPersona: !!personas.length,
        }
    }, [currentIdentifier, personas, lastRecognized.identifier?.toText(), activatedSocialNetworkUI])
}
