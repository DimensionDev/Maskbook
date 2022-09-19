import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions'
import type { SiteAdaptor } from '../types'

const origins = ['https://*.mirror.xyz/*']
export const MirrorAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.Mirror,
    declarativePermissions: { origins },
    homepage: 'https://mirror.xyz',
    getProfilePage: () => new URL('https://mirror.xyz/dashboard'),
    getShareLinkURL(message) {
        return new URL('https://mirror.xyz')
    },
}

defineSiteAdaptor(MirrorAdaptor)
