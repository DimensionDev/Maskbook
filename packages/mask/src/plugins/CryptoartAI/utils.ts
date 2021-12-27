import BigNumber from 'bignumber.js'
import type { AssetEvent, Order } from 'opensea-js/lib/types'
import { parseURL } from '@masknet/shared-base'
import { ChainId, formatBalance } from '@masknet/web3-shared-evm'
import { escapeRegExp } from 'lodash-unified'
import { prefixPath, mainNetwork, testNetwork } from './constants'
import type { Token } from './types'

export function checkUrl(url: string): boolean {
    const protocol = 'https://'
    const _url = new URL(url.startsWith(protocol) ? url : protocol + url)
    return [mainNetwork.hostname, testNetwork.hostname].includes(_url.hostname) && _url.pathname.includes(prefixPath)
}

export function getRelevantUrl(textContent: string) {
    const urls = parseURL(textContent)
    return urls.find(checkUrl)
}

export function getAssetInfoFromURL(url?: string) {
    if (!url) return null

    const addresses = {
        [ChainId.Kovan]: testNetwork.contractAddress,
        [ChainId.Mainnet]: mainNetwork.contractAddress,
    }

    const { hostname, pathname } = new URL(url)
    const pattern = new RegExp(`^${escapeRegExp(prefixPath)}${/\/([^/]+)\/(\d+)/.source}$`, 'g')
    const matched = pattern.exec(pathname)
    if (!matched) {
        return null // early return
    }

    const chain_id = hostname === testNetwork.hostname ? ChainId.Kovan : ChainId.Mainnet
    const creator = matched[1]
    const token_id = matched[2]
    const contractAddress = addresses[chain_id]
    return { chain_id, creator, token_id, contractAddress }
}

export function getOrderUnitPrice(order: Order) {
    if (!order.currentPrice || !order.paymentTokenContract?.decimals) return
    const price = formatBalance(order.currentPrice, order.paymentTokenContract.decimals)
    const quantity = formatBalance(order.quantity, new BigNumber(order.quantity).toString() !== '1' ? 8 : 0)

    return new BigNumber(price).dividedBy(quantity).toFixed(4, 1)
}

export function getOrderUSDPrice(order: Order) {
    if (!order.currentPrice || !order.paymentTokenContract?.decimals) return
    const price = formatBalance(order.paymentTokenContract.usdPrice, 0)
    const quantity = formatBalance(order.currentPrice, order.paymentTokenContract.decimals)

    return new BigNumber(price).multipliedBy(quantity).toFixed(2, 1)
}

export function getLastSalePrice(lastSale: AssetEvent | null) {
    if (!lastSale?.totalPrice || !lastSale?.paymentToken?.decimals) return
    const price = formatBalance(lastSale.totalPrice, lastSale.paymentToken.decimals)
    return price
}

export function toTokenIdentifier(token?: Token) {
    if (!token) return ''
    return `${token.contractAddress}_${token.tokenId}`
}
