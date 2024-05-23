import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*', 'https://www.x.com/*', 'https://x.com/*']
export const TwitterAdaptor: SiteAdaptor.Definition = {
    name: 'X',
    networkIdentifier: EnhanceableSite.Twitter,
    declarativePermissions: { origins },
    homepage: 'https://x.com',
    isSocialNetwork: true,
    sortIndex: 0,
}
