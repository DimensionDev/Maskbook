import { parseURL } from '../../utils/utils'
import { foundationPathnameRegexMatcher } from './constants'
import { ChainId } from '@masknet/web3-shared'

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
    //#region foundation
    const foundationMatched = _url.pathname.match(foundationPathnameRegexMatcher)

    if (foundationMatched) {
        const tokenId = foundationMatched[0].split('-').slice(-1)[0]
        return {
            chain_id: _url.host.includes('gorli') ? ChainId.Gorli : ChainId.Mainnet,
            token_id: tokenId,
        }
    }
    //#endregion
    // nothing matched
    return
}

export function convertDate(unix: string) {
    const date = new Date(Number.parseInt(unix, 10) * 1000)
    return date.toLocaleString()
}
