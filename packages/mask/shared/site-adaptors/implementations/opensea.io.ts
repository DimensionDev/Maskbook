import { EnhanceableSite } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { defineSiteAdaptor } from '../definitions'
import type { SiteAdaptor } from '../types'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://opensea.io/*']
export const OpenSeaAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.Minds,
    declarativePermissions: { origins },
    homepage: 'https://opensea.io/',

    getProfilePage: () => new URL('https://opensea.io/account'),
    getShareLinkURL(message) {
        const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
            intentUrl: message,
        })
        return new URL(url)
    },
}
defineSiteAdaptor(OpenSeaAdaptor)
