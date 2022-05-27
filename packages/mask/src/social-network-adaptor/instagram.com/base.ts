import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork } from '../../social-network/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Instagram,
    encryptionNetwork: SocialNetworkEnum.Instagram,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.Instagram)
    },
}
