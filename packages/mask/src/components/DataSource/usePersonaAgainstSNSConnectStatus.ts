import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { PersonaInformation, NextIDPlatform } from '@masknet/shared-base'
import Services from '../../extension/service'
import { activatedSocialNetworkUI } from '../../social-network'
import { useLastRecognizedIdentity } from './useActivatedUI'
import { useMyPersonas } from './useMyPersonas'
import { useSetupGuideStatusState } from './useNextID'

export function usePersonaAgainstSNSConnectStatus() {
    const ui = activatedSocialNetworkUI
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
    const lastState = useSetupGuideStatusState()
    const lastRecognized = useLastRecognizedIdentity()
    const username = useMemo(() => {
        return lastState.username || lastRecognized.identifier?.userId
    }, [lastState, lastRecognized])
    const personas = useMyPersonas()

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
    }, [platform, username, ui, personas])
}
