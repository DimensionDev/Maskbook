import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork } from '../../social-network/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const twitterBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Twitter,
    encryptionNetwork: SocialNetworkEnum.Twitter,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export function isTwitter(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === EnhanceableSite.Twitter
}
