import { EnhanceableSite } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://opensea.io/*']
export const OpenSeaAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.OpenSea,
    declarativePermissions: { origins },
    homepage: 'https://opensea.io/',
    isSocialNetwork: false,

    getProfilePage: () => new URL('https://opensea.io/account'),
    getShareLinkURL(message) {
        const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
            intentUrl: message,
        })
        return new URL(url)
    },
}
defineSiteAdaptor(OpenSeaAdaptor)
