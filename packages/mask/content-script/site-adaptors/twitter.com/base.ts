import { EncryptPayloadNetwork } from '@masknet/encryption'
import type { SiteAdaptor } from '@masknet/types'
import { EnhanceableSite, isDomainOrSubdomainOf } from '@masknet/shared-base'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*', 'https://www.x.com/*', 'https://x.com/*']
export const twitterBase: SiteAdaptor.Base = {
    networkIdentifier: EnhanceableSite.Twitter,
    encryptPayloadNetwork: EncryptPayloadNetwork.Twitter,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return (
            (isDomainOrSubdomainOf(location.href, 'twitter.com') || isDomainOrSubdomainOf(location.href, 'x.com')) &&
            !location.pathname.startsWith('/i/cards-frame/')
        )
    },
}
