import { BigNumber } from 'bignumber.js'
import { pow10, ZERO } from '@masknet/web3-shared-base'

export function getOrderUSDPrice(currentPrice?: string, usdPrice?: string, decimals?: number) {
    if (!currentPrice || !decimals) return ZERO
    const quantity = new BigNumber(currentPrice).div(pow10(decimals))
    return new BigNumber(usdPrice ?? 0).multipliedBy(quantity).decimalPlaces(2, 2)
}
