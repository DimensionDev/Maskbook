import { EnhanceableSite } from '@masknet/shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://opensea.io/*']
export const OpenSeaAdaptor: SiteAdaptor.Definition = {
    name: 'OpenSea',
    networkIdentifier: EnhanceableSite.OpenSea,
    declarativePermissions: { origins },
    homepage: 'https://opensea.io/',
    isSocialNetwork: false,

    getProfilePage: () => new URL('https://opensea.io/account'),
    getShareLinkURL: (message) => new URL('https://opensea.io'),
}
defineSiteAdaptor(OpenSeaAdaptor)
