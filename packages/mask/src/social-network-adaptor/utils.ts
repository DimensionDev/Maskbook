import { twitterBase } from './twitter.com/base.js'
import { facebookBase } from './facebook.com/base.js'
import { instagramBase } from './instagram.com/base.js'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import type { SocialNetwork } from '../social-network/types.js'
import { activatedSocialNetworkUI, globalUIState } from '../social-network/index.js'
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
          linkedPersona?: PersonaIdentifier
      }
    | undefined {
    const current = activatedSocialNetworkUI.collecting.identityProvider?.recognized.value

    return (
        globalUIState.profiles.value.find((i) => i.identifier === current?.identifier) ||
        globalUIState.profiles.value[0]
    )
}
