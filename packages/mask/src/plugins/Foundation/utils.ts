import { parseURL } from '@masknet/shared-base'
import { foundationPathnameRegexMatcher } from './constants'
import { ChainId } from '@masknet/web3-shared-evm'

export function checkUrl(url: string): boolean {
    if (url.includes('foundation.app/@')) {
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
    const foundationMatched = _url.pathname.match(foundationPathnameRegexMatcher)
    if (foundationMatched) {
        return {
            chainId: _url.host.includes('gorli') ? ChainId.Gorli : ChainId.Mainnet,
            link: url,
        }
    }
    return
}

export function convertDate(unix: string) {
    const date = new Date(Number.parseInt(unix, 10) * 1000)
    return date.toLocaleString()
}
