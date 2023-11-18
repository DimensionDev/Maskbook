import { EncryptPayloadNetwork } from '@masknet/encryption'
import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '@masknet/types'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const facebookBase: SiteAdaptor.Base = {
    encryptPayloadNetwork: EncryptPayloadNetwork.Facebook,
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    shouldActivate(location) {
        //                                                   facebook share widget
        return location.hostname.endsWith('facebook.com') && location.pathname !== '/v2.0/plugins/like.php'
    },
}
