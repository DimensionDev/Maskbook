import { twitterBase } from './twitter.com/base'
import { facebookBase } from './facebook.com/base'
import { instagramBase } from './instagram.com/base'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import type { SocialNetwork } from '../social-network/types'
import { activatedSocialNetworkUI, globalUIState } from '../social-network'
import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'

export function getCurrentSNSNetwork(current: SocialNetwork.Base['networkIdentifier']) {
    const table = {
        [twitterBase.networkIdentifier]: CurrentSNSNetwork.Twitter,
        [facebookBase.networkIdentifier]: CurrentSNSNetwork.Facebook,
        [instagramBase.networkIdentifier]: CurrentSNSNetwork.Instagram,
    }
    if (current in table) return table[current]
    return CurrentSNSNetwork.Unknown
}

export function getCurrentIdentifier():
    | {
          identifier: ProfileIdentifier
          linkedPersona?: { identifier: PersonaIdentifier }
      }
    | undefined {
    const current = activatedSocialNetworkUI.collecting.identityProvider?.recognized.value

    return (
        globalUIState.profiles.value.find((i) => i.identifier === current?.identifier) ||
        globalUIState.profiles.value[0]
    )
}
