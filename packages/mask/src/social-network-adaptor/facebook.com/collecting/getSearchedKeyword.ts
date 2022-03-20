import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../base'

export default function getSearchedKeywordAtFacebook() {
    if (!isFacebook(activatedSocialNetworkUI)) return ''

    const hashKeyword = location.pathname.match(/^\/hashtag\/([A-za-z0\u20139_]+)$/u)?.[1]
    if (hashKeyword) return '#' + hashKeyword

    if (/\/search\/top\/?$/.test(location.pathname)) {
        const params = new URLSearchParams(location.search)
        return decodeURIComponent(params.get('q') ?? '')
    }

    return ''
}
