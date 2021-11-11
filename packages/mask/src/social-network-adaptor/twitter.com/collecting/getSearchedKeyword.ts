import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../base'

/**
 * Listing all possible pathnames start from /search that the search box will keep existing on twitter.
 * That means the keyword will not be cleaned and related components keep injecting.
 * Otherwise, if a pathname not in this list the keyword will be cleaned and remove relative components from DOM.
 */
const SAFE_PATHNAMES_ON_TWITTER = [
    '/compose/tweet',
    '/search-advanced',
    '/settings/trends',
    '/settings/search',
    '/i/display',
    '/account/switch',
    '/i/keyboard_shortcuts',
]

export default function getSearchedKeywordAtTwitter(): string {
    if (!isTwitter(activatedSocialNetworkUI)) return ''
    const params = new URLSearchParams(location.search)
    const hashTagMatched = location.pathname.match(/\/hashtag\/([A-Za-z]+)/)
    if (location.pathname === '/search' && !params.get('f')) return decodeURIComponent(params.get('q') ?? '')
    else if (hashTagMatched) return '#' + hashTagMatched[1]
    else if (!SAFE_PATHNAMES_ON_TWITTER.includes(location.pathname)) return ''

    return ''
}
