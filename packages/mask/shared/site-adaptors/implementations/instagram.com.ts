import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']

export const InstagramAdaptor: SiteAdaptor.Definition = {
    name: 'Instagram',
    networkIdentifier: EnhanceableSite.Instagram,
    declarativePermissions: { origins },
    homepage: 'https://www.instagram.com/',
    isSocialNetwork: true,
    sortIndex: 3,
}
