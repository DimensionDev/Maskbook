import { activatedSocialNetworkUI } from '../social-network/ui'
import { twitterBase } from './twitter.com/base'
import { facebookBase } from './facebook.com/base'
import { instagramBase } from './instagram.com/base'

export enum SupportedNetworks {
    Facebook = 1,
    Twitter,
    Instagram,
}
export function getNetwork() {
    const table = {
        [twitterBase.networkIdentifier]: SupportedNetworks.Twitter,
        [facebookBase.networkIdentifier]: SupportedNetworks.Facebook,
        [instagramBase.networkIdentifier]: SupportedNetworks.Instagram,
    }
    const current = activatedSocialNetworkUI.networkIdentifier
    if (current in table) return table[current]
    return null
}
