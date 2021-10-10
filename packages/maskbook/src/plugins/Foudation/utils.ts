import { parseURL } from '../../utils/utils'
import { foundationPathnameRegexMatcher } from './constants'
import { ChainId } from '@masknet/web3-shared'
import type { MostRecentAuction, GraphData, Metadata } from './types'
import { querySubgaphs, getMetadata } from './apis'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)
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
            address: 'test',
            token_id: tokenId,
        }
    }
    //#endregion
    // nothing matched
    return
}

export function sliceAddress(address: string | undefined) {
    if (address) {
        const pathSlit = address.split('/')
        const pathTwo = pathSlit[pathSlit.length - 2].slice(-4)
        return [pathTwo.slice(0, 2), pathTwo.slice(2), pathSlit[pathSlit.length - 2]]
    }
    return ['']
}

export function convertDate(unix: string) {
    const date = new Date(Number.parseInt(unix, 10) * 1000)
    return date.toLocaleString()
}

export function CurrentPrice(t: any, mostRecentAuction: MostRecentAuction) {
    if (mostRecentAuction) {
        if (mostRecentAuction.highestBid) {
            return `${t('plugin_foundation_highest')} ${mostRecentAuction.highestBid.amountInETH}`
        }
        return `${t('plugin_foundation_reserve')} ${mostRecentAuction.reservePriceInETH}`
    }
    return null
}

export function getTokenId(link: string) {
    if (link.includes('/~/')) {
        return link.split('/')
    }
    return link.split('-')
}

export async function fetchApi(link: string, chainid: ChainId) {
    const tokenId = getTokenId(link)
    const graph: GraphData = await querySubgaphs(tokenId[tokenId.length - 1], chainid)
    const metadata: Metadata = await getMetadata(graph.data.nfts[0].tokenIPFSPath.split('/')[0])
    return { graph, metadata }
}
