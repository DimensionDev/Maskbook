import { SiteAdaptor } from '@masknet/plugin-infra'
import type { SocialNetwork } from '@masknet/types'
import { EnhanceableSite, type PersonaIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { activatedSocialNetworkUI, globalUIState } from '../social-network/index.js'

export function getCurrentSNSNetwork(current: SocialNetwork.Base['networkIdentifier']): SiteAdaptor {
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
    const current = activatedSocialNetworkUI.collecting.identityProvider?.recognized.value

    return (
        globalUIState.profiles.value.find((i) => i.identifier === current?.identifier) ||
        globalUIState.profiles.value[0]
    )
}
