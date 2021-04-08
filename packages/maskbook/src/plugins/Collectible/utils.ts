import { parseURL } from '../../utils/utils'
import {
    openseaHostname,
    openseaPathnameRegexMatcher,
    raribleHostnames,
    rariblePathnameRegexMatcher,
} from './constants'
import type { Order } from 'opensea-js/lib/types'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)

    return (
        (_url.hostname === openseaHostname && openseaPathnameRegexMatcher.test(_url.pathname)) ||
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
    const matches = _url.pathname.match(openseaPathnameRegexMatcher)

    return matches
        ? {
              address: matches[1],
              token_id: matches[2],
          }
        : null
}

export function getOrderUnitPrice(order: Order) {
    if (!order.currentPrice || !order.paymentTokenContract?.decimals) return
    const price = formatBalance(new BigNumber(order.currentPrice), order.paymentTokenContract.decimals)
    const quantity = formatBalance(
        new BigNumber(order.quantity),
        new BigNumber(order.quantity).toString() !== '1' ? 8 : 0,
    )

    return new BigNumber(price).dividedBy(quantity).toFixed(4, 1).toString()
}
