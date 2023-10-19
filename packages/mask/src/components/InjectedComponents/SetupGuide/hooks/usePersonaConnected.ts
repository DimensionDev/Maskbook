import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { SetupGuideContext } from '../SetupGuideContext.js'

export function usePersonaConnected() {
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const { userId, destinedPersonaInfo: personaInfo } = SetupGuideContext.useContainer()
    const connected = personaInfo?.linkedProfiles.some(
        (x) => x.identifier.network === site && x.identifier.userId === userId,
    )
    return connected
}
