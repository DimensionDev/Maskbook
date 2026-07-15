export default function getSearchedKeywordAtFacebook() {
    const hashKeyword = location.pathname.match(/^\/hashtag\/([A-za-z0\u{2013}9_]+)$/u)?.[1]
    if (hashKeyword) return '#' + hashKeyword

    if (/\/search\/top\/?$/u.test(location.pathname)) {
        const params = new URLSearchParams(location.search)
        return params.get('q') ?? ''
    }

    return ''
}
