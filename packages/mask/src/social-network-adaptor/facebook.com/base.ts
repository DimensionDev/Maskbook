import { SocialNetworkEnum } from '@masknet/encryption'
import { EnhanceableSite } from '@masknet/web3-shared-base'
import type { SocialNetwork } from '@masknet/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const facebookBase: SocialNetwork.Base = {
    encryptionNetwork: SocialNetworkEnum.Facebook,
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('facebook.com')
    },
}

export function isFacebook(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === EnhanceableSite.Facebook
}
