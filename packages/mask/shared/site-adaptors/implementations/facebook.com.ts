import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions'
import type { SiteAdaptor } from '../types'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']
export const FacebookAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    homepage: 'https://www.facebook.com',

    getProfilePage: () => new URL('https://www.facebook.com'),
    getShareLinkURL(message) {
        const url = urlcat('https://www.facebook.com/sharer/sharer.php', {
            quote: message,
            u: 'mask.io',
        })
        return new URL(url)
    },
}
defineSiteAdaptor(FacebookAdaptor)
