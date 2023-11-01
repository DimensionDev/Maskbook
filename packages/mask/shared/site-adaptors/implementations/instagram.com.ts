import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

import.meta.webpackHot?.accept()

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
const InstagramAdaptor: SiteAdaptor.Definition = {
    name: 'Instagram',
    networkIdentifier: EnhanceableSite.Instagram,
    declarativePermissions: { origins },
    homepage: 'https://www.instagram.com/',
    isSocialNetwork: true,
    sortIndex: 3,
    getProfilePage: () => new URL('https://www.instagram.com/'),
    getShareLinkURL: null,
}
defineSiteAdaptor(InstagramAdaptor)
