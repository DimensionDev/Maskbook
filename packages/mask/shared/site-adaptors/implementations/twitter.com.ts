import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://mobile.twitter.com/*', 'https://twitter.com/*']
export const TwitterAdaptor: SiteAdaptor.Definition = {
    name: 'Twitter',
    networkIdentifier: EnhanceableSite.Twitter,
    declarativePermissions: { origins },
    homepage: 'https://twitter.com',
    isSocialNetwork: true,
    sortIndex: 0,
    getProfilePage: (userId) => new URL(`https://twitter.com/${userId.userId}`),
    getShareLinkURL(message) {
        const url = urlcat('https://twitter.com/intent/tweet', { text: message })
        return new URL(url)
    },
}
