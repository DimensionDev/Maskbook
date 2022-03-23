import BigNumber from 'bignumber.js'
import { isOne, pow10 } from '@masknet/web3-shared-base'
import { resolveIPFSLink } from '@masknet/web3-shared-evm'

export function getOrderUnitPrice(currentPrice?: string, decimals?: number, quantity?: string) {
    if (!currentPrice || !decimals || !quantity) return
    const _currentPrice = new BigNumber(currentPrice).div(pow10(decimals))
    const _quantity = new BigNumber(quantity).div(pow10(isOne(quantity) ? 0 : 8))
    return _currentPrice.dividedBy(_quantity).decimalPlaces(4, 2)
}

export function getOrderUSDPrice(currentPrice?: string, usdPrice?: string, decimals?: number) {
    if (!currentPrice || !decimals) return
    const quantity = new BigNumber(currentPrice).div(pow10(decimals))
    return new BigNumber(usdPrice ?? 0).multipliedBy(quantity).decimalPlaces(2, 2)
}

export function toImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('ipfs://')) {
        const cid = url.replace(/^ipfs:\/\//, '')
        return resolveIPFSLink(cid)
    }
    return url
}
