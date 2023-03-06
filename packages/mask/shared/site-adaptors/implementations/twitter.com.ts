import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/web3-shared-base'
import { defineSiteAdaptor } from '../definitions.js'
import type { SiteAdaptor } from '../types.js'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const TwitterAdaptor: SiteAdaptor.Definition = {
    name: 'Twitter',
    networkIdentifier: EnhanceableSite.Twitter,
    declarativePermissions: { origins },
    homepage: 'https://twitter.com',
    isSocialNetwork: true,

    getProfilePage: (userId) => new URL(`https://twitter.com/${userId.userId}`),
    getShareLinkURL(message) {
        const url = urlcat('https://twitter.com/intent/tweet', { text: message })
        return new URL(url)
    },
}
defineSiteAdaptor(TwitterAdaptor)
