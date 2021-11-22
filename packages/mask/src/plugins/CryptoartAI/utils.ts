import BigNumber from 'bignumber.js'
import type { AssetEvent, Order } from 'opensea-js/lib/types'
import { parseURL } from '../../utils/utils'
import { cryptoartaiHostnames, cryptoartaiPathnameRegexMatcher, cryptoartaiContractAddress } from './constants'
import { ChainId, formatBalance } from '@masknet/web3-shared-evm'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)
    return cryptoartaiHostnames.includes(_url.hostname) && _url.pathname.includes(cryptoartaiPathnameRegexMatcher)
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null
    const _url = new URL(url)
    const urldata = _url.pathname
        .substring(_url.pathname.indexOf(cryptoartaiPathnameRegexMatcher) + cryptoartaiPathnameRegexMatcher.length)
        .split('/')
    if (urldata.length >= 2) {
        return {
            chain_id: url.includes(cryptoartaiHostnames[1]) ? ChainId.Kovan : ChainId.Mainnet,
            creator: urldata[0],
            token_id: urldata[1],
            contractAddress: url.includes(cryptoartaiHostnames[1])
                ? cryptoartaiContractAddress[1]
                : cryptoartaiContractAddress[0],
        }
    }

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

export function getLastSalePrice(lastSale: AssetEvent | null) {
    if (!lastSale?.totalPrice || !lastSale?.paymentToken?.decimals) return
    const price = formatBalance(lastSale.totalPrice, lastSale.paymentToken.decimals)
    return price
}

export function subAddressStr(theName: string, theLength: number = 7) {
    return theName ? (theName.length > theLength ? theName.substr(0, theLength) + '...' : theName) : null
}
