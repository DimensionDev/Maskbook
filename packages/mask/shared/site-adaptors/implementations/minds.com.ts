import { EnhanceableSite } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { defineSiteAdaptor } from '../definitions'
import type { SiteAdaptor } from '../types'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const MindsAdaptor: SiteAdaptor.Definition = {
    networkIdentifier: EnhanceableSite.Minds,
    declarativePermissions: { origins },
    homepage: 'https://www.minds.com',

    getProfilePage: () => new URL('https://www.minds.com'),
    getShareLinkURL(message) {
        const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
            intentUrl: message,
        })
        return new URL(url)
    },
}
defineSiteAdaptor(MindsAdaptor)
