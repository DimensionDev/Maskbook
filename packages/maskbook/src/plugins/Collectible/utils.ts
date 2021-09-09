import BigNumber from 'bignumber.js'
import type { Order } from 'opensea-js/lib/types'
import { parseURL } from '../../utils/utils'
import {
    openseaHostnames,
    openseaPathnameRegexMatcher,
    raribleHostnames,
    rariblePathnameRegexMatcher,
} from './constants'
import { ChainId, formatBalance } from '@masknet/web3-shared'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return (
        (openseaHostnames.includes(_url.hostname) && openseaPathnameRegexMatcher.test(_url.pathname)) ||
        (raribleHostnames.includes(_url.hostname) && rariblePathnameRegexMatcher.test(_url.pathname))
    )
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)

    //#region opensea
    const openSeaMatched = _url.pathname.match(openseaPathnameRegexMatcher)
    if (openSeaMatched) {
        return {
            chain_id: _url.host.includes('testnets') ? ChainId.Rinkeby : ChainId.Mainnet,
            address: openSeaMatched[1],
            token_id: openSeaMatched[2],
        }
    }
    //#endregion

    //#region rarible
    const raribleMatched = _url.pathname.match(rariblePathnameRegexMatcher)
    if (raribleMatched) {
        return {
            chain_id: _url.host.includes('ropsten')
                ? ChainId.Ropsten
                : _url.host.includes('rinkeby')
                ? ChainId.Rinkeby
                : ChainId.Mainnet,
            address: raribleMatched[1],
            token_id: raribleMatched[2],
        }
    }
    //#endregion

    // nothing matched
    return
}

export function getOrderUnitPrice(order: Order) {
    if (!order.currentPrice || !order.paymentTokenContract?.decimals) return
    const price = formatBalance(order.currentPrice, order.paymentTokenContract.decimals)
    const quantity = formatBalance(order.quantity, new BigNumber(order.quantity).toString() !== '1' ? 8 : 0)

    return new BigNumber(price).dividedBy(quantity).toFixed(4, 1).toString()
}

export function getOrderUSDPrice(order: Order) {
    if (!order.currentPrice || !order.paymentTokenContract?.decimals) return
    const price = formatBalance(order.paymentTokenContract.usdPrice, 0)
    const quantity = formatBalance(order.currentPrice, order.paymentTokenContract.decimals)

    return new BigNumber(price).multipliedBy(quantity).toFixed(2, 1).toString()
}
