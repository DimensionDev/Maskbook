import urlcat from 'urlcat'
import { EnhanceableSite } from '@masknet/shared-base'

export function getShareLinkURL(text: string, site?: EnhanceableSite) {
    switch (site) {
        case EnhanceableSite.Twitter: {
            const url = urlcat('https://twitter.com/intent/tweet', { text })
            return new URL(url)
        }
        case EnhanceableSite.Facebook: {
            const url = urlcat('https://www.facebook.com/sharer/sharer.php', {
                quote: text,
                u: 'mask.io',
            })
            return new URL(url)
        }
        case EnhanceableSite.Minds: {
            const url = urlcat('https://www.minds.com/newsfeed/subscriptions', {
                intentUrl: text,
            })
            return new URL(url)
        }
        default:
            return new URL('https://mask.io')
    }
}
