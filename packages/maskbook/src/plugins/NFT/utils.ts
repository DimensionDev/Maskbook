// nftUrl can be of these forms:
//  - https://opensea.io/assets/<address>/<token_id>
//  - https://app.rarible.com/token/<address>:<token_id>
//
// TODO: discuss about the superrare url format

import {
    openseaHostname,
    openseaPathnameRegexMatcher,
    raribleHostname,
    rariblePathnameRegexMatcher,
    urlRegexMatcher,
} from './constants'

function checkUrl(url: URL): boolean {
    if (url.hostname === openseaHostname && openseaPathnameRegexMatcher.test(url.pathname)) return true
    else if (url.hostname === raribleHostname && rariblePathnameRegexMatcher.test(url.pathname)) return true

    return false
}

export function getRelevantUrl(textContent: string): URL | null {
    const urls = urlRegexMatcher.exec(textContent)

    if (urls) {
        for (let url of urls) {
            let _url = new URL(url)
            if (checkUrl(_url)) return _url
        }
    }

    return null
}

export function parseNftUrl(nftUrl: URL): [string, string] | any {
    let address = null,
        tokenId = null

    if (nftUrl.hostname === openseaHostname && openseaPathnameRegexMatcher.test(nftUrl.pathname)) {
        address = RegExp.$1
        tokenId = RegExp.$2
    } else if (nftUrl.hostname === raribleHostname && rariblePathnameRegexMatcher.test(nftUrl.pathname)) {
        address = RegExp.$1
        tokenId = RegExp.$2
    }

    return [address, tokenId]
}
