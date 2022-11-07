import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import type { SocialNetwork } from '@masknet/types'
import { EnhanceableSite, PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { activatedSocialNetworkUI, globalUIState } from '../social-network/index.js'

export function getCurrentSNSNetwork(current: SocialNetwork.Base['networkIdentifier']): CurrentSNSNetwork {
    const table: Partial<Record<EnhanceableSite, CurrentSNSNetwork>> = {
        [EnhanceableSite.Twitter]: CurrentSNSNetwork.Twitter,
        [EnhanceableSite.Facebook]: CurrentSNSNetwork.Facebook,
        [EnhanceableSite.Instagram]: CurrentSNSNetwork.Instagram,
        [EnhanceableSite.Minds]: CurrentSNSNetwork.Minds,
    }
    return table[current] ?? CurrentSNSNetwork.Unknown
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
