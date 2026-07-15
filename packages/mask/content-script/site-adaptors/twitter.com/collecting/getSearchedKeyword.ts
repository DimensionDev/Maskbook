/**
 * Listing all possible pathnames start from /search that the search box will keep existing on twitter.
 * That means the keyword will not be cleaned and related components keep injecting.
 * Otherwise, if a pathname not in this list the keyword will be cleaned and remove relative components from DOM.
 */
const SAFE_PATHNAMES_ON_TWITTER = new Set([
    // redirect to /compose/post
    '/compose/tweet',
    '/compose/post',
    '/search-advanced',
    '/settings/trends',
    '/settings/search',
    '/i/display',
    '/account/switch',
    '/i/keyboard_shortcuts',
])

export default function getSearchedKeywordAtTwitter(): string {
    const params = new URLSearchParams(location.search)
    const hashTagMatched = /\/hashtag\/([\dA-Za-z]+)/u.exec(location.pathname)
    const isTabAvailable = ['top'].includes(params.get('f') ?? '')
    if (location.pathname === '/search' && (!params.get('f') || isTabAvailable)) return params.get('q') ?? ''
    else if (hashTagMatched) return '#' + hashTagMatched[1]
    else if (!SAFE_PATHNAMES_ON_TWITTER.has(location.pathname)) return ''

    return ''
}
