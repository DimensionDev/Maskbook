import { type BigNumber } from 'bignumber.js'
import { isLessThan, isZero, leftShift, trimZero } from '@masknet/web3-shared-base'

/**
 * Yet another formatBalance.
 */
export const formatBalance = (balance?: BigNumber.Value, decimals?: number) => {
    if (!balance || isZero(balance) || !decimals) return '0'
    const value = leftShift(balance, decimals)
    if (isLessThan(value, 0.0001)) return '<0.0001'
    return trimZero(value.toFixed(4))
}
