import { activatedSocialNetworkUI } from '../social-network/ui'
import { twitterBase } from './twitter.com/base'
import { facebookBase } from './facebook.com/base'
import { instagramBase } from './instagram.com/base'
import { CurrentSNSNetwork } from '@dimensiondev/mask-plugin-infra/src'

export function getCurrentSNSNetwork() {
    const table = {
        [twitterBase.networkIdentifier]: CurrentSNSNetwork.Twitter,
        [facebookBase.networkIdentifier]: CurrentSNSNetwork.Facebook,
        [instagramBase.networkIdentifier]: CurrentSNSNetwork.Instagram,
    }
    const current = activatedSocialNetworkUI.networkIdentifier
    if (current in table) return table[current]
    return CurrentSNSNetwork.Unknown
}
