import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*', 'https://facebook.com/*']

export const FacebookAdaptor: SiteAdaptor.Definition = {
    name: 'Facebook',
    networkIdentifier: EnhanceableSite.Facebook,
    declarativePermissions: { origins },
    homepage: 'https://www.facebook.com',
    isSocialNetwork: true,
    sortIndex: 1,
}
