import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://mask.io/*']
export const MaskAdaptor: SiteAdaptor.Definition = {
    name: 'Mask',
    networkIdentifier: EnhanceableSite.Mask,
    declarativePermissions: { origins },
    homepage: 'https://mask.io',
    isSocialNetwork: false,
    sortIndex: 5,
    getProfilePage: () => null,
    getShareLinkURL(message) {
        return new URL('https://mask.io')
    },
}
defineSiteAdaptor(MaskAdaptor)
