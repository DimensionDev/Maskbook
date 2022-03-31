export default function getSearchedKeywordAtMinds() {
    const params = new URLSearchParams(location.search)
    if (location.pathname === '/discovery/search') {
        return decodeURIComponent(params.get('q') ?? '')
    }

    return ''
}
