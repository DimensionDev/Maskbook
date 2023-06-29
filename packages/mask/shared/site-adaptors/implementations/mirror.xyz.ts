import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://*.mirror.xyz/*']
export const MirrorAdaptor: SiteAdaptor.Definition = {
    name: 'Mirror',
    networkIdentifier: EnhanceableSite.Mirror,
    declarativePermissions: { origins },
    homepage: 'https://mirror.xyz',
    isSocialNetwork: false,
    sortIndex: 2,
    getProfilePage: () => new URL('https://mirror.xyz/dashboard'),
    getShareLinkURL(message) {
        return new URL('https://mirror.xyz')
    },
}

defineSiteAdaptor(MirrorAdaptor)
