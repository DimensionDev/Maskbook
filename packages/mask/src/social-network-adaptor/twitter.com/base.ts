import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SiteAdaptor } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const twitterBase: SiteAdaptor.Base = {
    networkIdentifier: EnhanceableSite.Twitter,
    encryptPayloadNetwork: EncryptPayloadNetwork.Twitter,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('twitter.com')
    },
}

export function isTwitter(ui: SiteAdaptor.Base) {
    return ui.networkIdentifier === EnhanceableSite.Twitter
}
