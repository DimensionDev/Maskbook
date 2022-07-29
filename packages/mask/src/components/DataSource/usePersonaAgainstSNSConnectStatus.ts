import { useAsyncRetry } from 'react-use'
import type { PersonaInformation } from '@masknet/shared-base'
import Services from '../../extension/service'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { usePersonasFromDB } from './usePersonasFromDB'
import { useSetupGuideStatus } from '../GuideStep/useSetupGuideStatus'

export function usePersonaAgainstSNSConnectStatus() {
    const personas = usePersonasFromDB()
    const lastState = useSetupGuideStatus()
    const lastRecognized = useLastRecognizedIdentity()
    const username = lastState.username || lastRecognized.identifier?.userId

    return useAsyncRetry(async () => {
        const checkSNSConnectToCurrentPersona = (persona: PersonaInformation) =>
            username ? persona.linkedProfiles.some((x) => x.identifier.userId === username) : false
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
    }, [username, personas.map((x) => x.identifier.toText()).join()])
}
