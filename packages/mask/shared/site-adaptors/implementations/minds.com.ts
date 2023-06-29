import { EnhanceableSite } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const MindsAdaptor: SiteAdaptor.Definition = {
    name: 'Minds',
    networkIdentifier: EnhanceableSite.Minds,
    declarativePermissions: { origins },
    homepage: 'https://www.minds.com',
    isSocialNetwork: true,
    sortIndex: 4,
    getProfilePage: () => new URL('https://www.minds.com'),
    getShareLinkURL(message) {
        const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
            intentUrl: message,
        })
        return new URL(url)
    },
}
defineSiteAdaptor(MindsAdaptor)
