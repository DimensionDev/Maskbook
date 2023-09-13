import { type PersonaIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { activatedSiteAdaptorUI, activatedSiteAdaptor_state } from '../site-adaptor-infra/index.js'

export function getCurrentIdentifier():
    | {
          identifier: ProfileIdentifier
          linkedPersona?: PersonaIdentifier
      }
    | undefined {
    const current = activatedSiteAdaptorUI!.collecting.identityProvider?.recognized.value

    return (
        activatedSiteAdaptor_state!.profiles.value.find((i) => i.identifier === current?.identifier) ||
        activatedSiteAdaptor_state!.profiles.value[0]
    )
}
