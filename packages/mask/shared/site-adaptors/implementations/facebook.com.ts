import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']
export const FacebookAdaptor: SiteAdaptor.Definition = {
    name: 'Facebook',
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    homepage: 'https://www.facebook.com',
    isSocialNetwork: true,
    sortIndex: 1,
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
