import { SiteAdaptor } from '@masknet/plugin-infra'
import type { SiteAdaptor as SiteAdaptorType } from '@masknet/types'
import { EnhanceableSite, type PersonaIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { activatedSiteAdaptorUI, activatedSiteAdaptor_state } from '../site-adaptor-infra/index.js'

export function getCurrentSNSNetwork(current: SiteAdaptorType.Base['networkIdentifier']): SiteAdaptor {
    const table: Partial<Record<EnhanceableSite, SiteAdaptor>> = {
        [EnhanceableSite.Twitter]: SiteAdaptor.Twitter,
        [EnhanceableSite.Facebook]: SiteAdaptor.Facebook,
        [EnhanceableSite.Instagram]: SiteAdaptor.Instagram,
        [EnhanceableSite.Minds]: SiteAdaptor.Minds,
    }
    return table[current] ?? SiteAdaptor.Unknown
}

export function getCurrentIdentifier():
    | {
          identifier: ProfileIdentifier
          linkedPersona?: PersonaIdentifier
      }
    | undefined {
    const current = activatedSiteAdaptorUI.collecting.identityProvider?.recognized.value

    return (
        activatedSiteAdaptor_state.profiles.value.find((i) => i.identifier === current?.identifier) ||
        activatedSiteAdaptor_state.profiles.value[0]
    )
}
