export default function getSearchedKeywordAtFacebook() {
    const hashKeyword = /^\/hashtag\/([A-za-z0\u{2013}9_]+)$/u.exec(location.pathname)?.[1]
    if (hashKeyword) return '#' + hashKeyword

    if (/\/search\/top\/?$/u.test(location.pathname)) {
        const params = new URLSearchParams(location.search)
        return params.get('q') ?? ''
    }

    return ''
}
