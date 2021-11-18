import { activatedSocialNetworkUI } from '../../../social-network'
import { isMinds } from '../base'

export default function getSearchedKeywordAtMinds() {
    if (!isMinds(activatedSocialNetworkUI)) return ''
    const params = new URLSearchParams(location.search)
    if (location.pathname === '/discovery/search') {
        return decodeURIComponent(params.get('q') ?? '')
    }

    return ''
}
