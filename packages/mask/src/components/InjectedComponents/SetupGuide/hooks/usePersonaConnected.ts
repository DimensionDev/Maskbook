import type { PersonaIdentifier } from '@masknet/shared-base'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { useSetupGuideStepInfo } from './useSetupGuideStepInfo.js'

export function usePersonaConnected(persona?: PersonaIdentifier) {
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const { userId, destinedPersonaInfo: personaInfo } = useSetupGuideStepInfo(persona)
    const connected = personaInfo?.linkedProfiles.some(
        (x) => x.identifier.network === site && x.identifier.userId === userId,
    )
    return connected
}
