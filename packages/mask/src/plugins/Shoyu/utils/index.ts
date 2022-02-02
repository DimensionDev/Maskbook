import { parseURL } from '@masknet/shared-base'
import { shoyuPathnameRegexMatcher } from './constants'
import { ChainId } from '@masknet/web3-shared-evm'

export function checkUrl(url: string): boolean {
    if (url.includes('shoyunft.com/@')) {
        return /-(\d+)|(\d+)$/.test(url)
    }
    return false
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)
    const shoyuMatched = _url.pathname.match(shoyuPathnameRegexMatcher)
    if (shoyuMatched) {
        return {
            chainId: _url.host.includes('rinkeby') ? ChainId.Rinkeby : ChainId.Mainnet,
            link: url,
        }
    }
    return
}

export function convertDate(unix: string) {
    const date = new Date(Number.parseInt(unix, 10) * 1000)
    return date.toLocaleString()
}
