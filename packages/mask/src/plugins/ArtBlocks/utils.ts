import { parseURL } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { artBlocksHostnames, artBlocksPathnameRegexMatcher } from './constants'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return artBlocksHostnames.includes(_url.hostname) && artBlocksPathnameRegexMatcher.test(_url.pathname)
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)

    const artBlocksMatched = _url.pathname.match(artBlocksPathnameRegexMatcher)

    if (artBlocksMatched) {
        return {
            chain_id: _url.host.includes('artist-staging') ? ChainId.Ropsten : ChainId.Mainnet,
            project_id: artBlocksMatched[1],
        }
    }

    // nothing matched
    return
}

export function buildTokenId(projectId: number, invocation: number) {
    return projectId * 1000000 + invocation
}
