import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SocialNetwork } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const instagramBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Instagram,
    encryptPayloadNetwork: EncryptPayloadNetwork.Instagram,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.Instagram)
    },
}
