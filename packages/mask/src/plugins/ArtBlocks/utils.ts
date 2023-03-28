import { parseURLs } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { artBlocksHostnames, artBlocksPathnameRegex } from './constants.js'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(/^https?:\/\//.test(url) ? url : protocol + url)

    return artBlocksHostnames.includes(_url.hostname) && artBlocksPathnameRegex.test(_url.pathname)
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURLs(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)

    const matches = _url.pathname.match(artBlocksPathnameRegex)

    if (matches) {
        return {
            chain_id: _url.host.includes('artist-staging') ? ChainId.Ropsten : ChainId.Mainnet,
            project_id: matches[1] ?? matches[2],
        }
    }

    // nothing matched
    return
}

export function buildTokenId(projectId: number, invocation: number) {
    return projectId * 1000000 + invocation
}
