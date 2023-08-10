export default function getSearchedKeywordAtFacebook() {
    const hashKeyword = location.pathname.match(/^\/hashtag\/([A-za-z0\u20139_]+)$/u)?.[1]
    if (hashKeyword) return '#' + hashKeyword

    if (/\/search\/top\/?$/.test(location.pathname)) {
        const params = new URLSearchParams(location.search)
        return params.get('q') ?? ''
    }

    return ''
}
