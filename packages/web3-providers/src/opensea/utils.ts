import BigNumber from 'bignumber.js'
import { formatBalance } from '@masknet/web3-shared-evm'

export function getOrderUnitPrice(currentPrice?: string, decimals?: number, quantity?: string) {
    if (!currentPrice || !decimals || !quantity) return
    currentPrice = formatBalance(currentPrice, decimals)
    quantity = formatBalance(quantity, new BigNumber(quantity).toString() !== '1' ? 8 : 0)
    return new BigNumber(currentPrice).dividedBy(quantity).decimalPlaces(4, 1)
}

export function getOrderUSDPrice(currentPrice?: string, usdPrice?: string, decimals?: number) {
    if (!currentPrice || !decimals) return
    const price = formatBalance(usdPrice, 0)
    const quantity = formatBalance(currentPrice, decimals)
    return new BigNumber(price).multipliedBy(quantity).decimalPlaces(2, 1)
}
