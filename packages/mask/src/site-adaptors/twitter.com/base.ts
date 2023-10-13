import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SiteAdaptor } from '@masknet/types'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const twitterBase: SiteAdaptor.Base = {
    networkIdentifier: EnhanceableSite.Twitter,
    encryptPayloadNetwork: EncryptPayloadNetwork.Twitter,
    declarativePermissions: { origins },
    shouldActivate(location) {
        const { hostname, pathname } = location
        return hostname.endsWith('twitter.com') && !pathname.startsWith('/i/cards-frame/')
    },
}

/**
 * @deprecated Use `Sniffings.is_twitter_page` instead
 */
export function isTwitter(ui: SiteAdaptor.Base) {
    return ui.networkIdentifier === EnhanceableSite.Twitter
}
