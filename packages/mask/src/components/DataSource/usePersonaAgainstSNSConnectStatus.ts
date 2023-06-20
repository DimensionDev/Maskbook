import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import type { PersonaAgainstSNSConnectStatus } from '@masknet/shared'
import type { PersonaInformation } from '@masknet/shared-base'
import Services from '../../extension/service.js'
import { useLastRecognizedIdentity } from './useActivatedUI.js'
import { usePersonasFromDB } from './usePersonasFromDB.js'
import { useSetupGuideStatus } from '../GuideStep/useSetupGuideStatus.js'

export function usePersonaAgainstSNSConnectStatus() {
    const personas = usePersonasFromDB()
    const lastState = useSetupGuideStatus()
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastState.username || lastRecognized.identifier?.userId
    const checkSNSConnectToCurrentPersona = useCallback(
        (persona: PersonaInformation) =>
            username ? persona.linkedProfiles.some((x) => x.identifier.userId === username) : false,
        [username],
    )

    return useAsyncRetry<PersonaAgainstSNSConnectStatus | undefined>(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        const currentPersona = (await Services.Identity.queryOwnedPersonaInformation(true)).find(
            (x) => x.identifier === currentPersonaIdentifier,
        )
        const currentSNSConnectedPersona = personas.find(checkSNSConnectToCurrentPersona)
        if (!currentPersona || !currentSNSConnectedPersona) return
        return {
            isSNSConnectToCurrentPersona: currentPersona ? checkSNSConnectToCurrentPersona(currentPersona) : false,
            currentPersonaPublicKey: currentPersona?.identifier.rawPublicKey,
            currentSNSConnectedPersonaPublicKey: currentSNSConnectedPersona?.identifier.rawPublicKey,
        }
    }, [checkSNSConnectToCurrentPersona, personas.map((x) => x.identifier.toText()).join(',')])
}
