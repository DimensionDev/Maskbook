// nftUrl can be of these forms:
//  - https://opensea.io/assets/<address>/<token_id>
//  - https://app.rarible.com/token/<address>:<token_id>
//
// TODO: discuss about the superrare url format

import { parseURL } from '../../utils/utils'
import { openseaHostname, openseaPathnameRegexMatcher, raribleHostname, rariblePathnameRegexMatcher } from './constants'

function checkUrl(url: URL): boolean {
    if (url.hostname === openseaHostname && openseaPathnameRegexMatcher.test(url.pathname)) return true
    if (url.hostname === raribleHostname && rariblePathnameRegexMatcher.test(url.pathname)) return true

    return false
}

export function getRelevantUrl(textContent: string): URL | null {
    const urls = parseURL(textContent)
    const protocol = 'https://'
    for (let url of urls) {
        // url may not include protocol, but URL(url) always requires an url string with protocol
        let urlWithProtocol = url.startsWith(protocol) ? url : protocol + url
        let _url = new URL(urlWithProtocol)
        if (checkUrl(_url)) return _url
    }
    return null
}

export function parseNftUrl(nftUrl: URL): [string, string] | any {
    let regexMatcher = null

    if (nftUrl.hostname === openseaHostname) regexMatcher = openseaPathnameRegexMatcher
    else if (nftUrl.hostname === raribleHostname) regexMatcher = rariblePathnameRegexMatcher

    if (!regexMatcher) return [null, null]
    const matches = regexMatcher.exec(nftUrl.pathname)

    if (!matches) return [null, null]
    return [matches[1], matches[2]]
}
