import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions'
import type { SiteAdaptor } from '../types'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
export const InstagramAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.Instagram,
    declarativePermissions: { origins },
    homepage: 'https://www.instagram.com/',

    getProfilePage: () => new URL('https://www.instagram.com/'),
    getShareLinkURL: null,
}
defineSiteAdaptor(InstagramAdaptor)
