const search = location.search

export function getPostURL() {
    return new URL(`${location.protocol}//${location.host}${search}`)
}
