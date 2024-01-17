import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import type { PersonaPerSiteConnectStatus } from '@masknet/shared'
import type { PersonaInformation } from '@masknet/shared-base'
import Services from '#services'
import { useLastRecognizedIdentity } from './useActivatedUI.js'
import { usePersonasFromDB } from '../../../shared-ui/hooks/usePersonasFromDB.js'
import { useSetupGuideStatus } from '../GuideStep/useSetupGuideStatus.js'

export function usePersonaPerSiteConnectStatus() {
    const personas = usePersonasFromDB()
    const lastState = useSetupGuideStatus()
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastState.username || lastRecognized.identifier?.userId
    const checkSiteConnectedToCurrentPersona = useCallback(
        (persona: PersonaInformation) =>
            username ? persona.linkedProfiles.some((x) => x.identifier.userId === username) : false,
        [username],
    )

    return useAsyncRetry<PersonaPerSiteConnectStatus | undefined>(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        const currentPersona = (await Services.Identity.queryOwnedPersonaInformation(true)).find(
            (x) => x.identifier === currentPersonaIdentifier,
        )
        const currentSiteConnectedPersona = personas.find(checkSiteConnectedToCurrentPersona)
        if (!currentPersona || !currentSiteConnectedPersona) return
        return {
            isSiteConnectedToCurrentPersona:
                currentPersona ? checkSiteConnectedToCurrentPersona(currentPersona) : false,
            currentPersonaPublicKey: currentPersona.identifier.rawPublicKey,
            currentSiteConnectedPersonaPublicKey: currentSiteConnectedPersona.identifier.rawPublicKey,
        }
    }, [checkSiteConnectedToCurrentPersona, personas.map((x) => x.identifier.toText()).join(',')])
}
