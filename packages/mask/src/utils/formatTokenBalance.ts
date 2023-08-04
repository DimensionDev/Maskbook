import { addThousandSeparators, isLessThan, isZero, leftShift, trimZero } from '@masknet/web3-shared-base'
import { type BigNumber } from 'bignumber.js'

/**
 * Yet another formatBalance
 */
export function formatTokenBalance(balance: BigNumber.Value = '0', decimals = 1) {
    if (isZero(balance)) return '0'
    const bn = leftShift(balance, decimals)
    if (isLessThan(bn, 0.0001)) return '<0.0001'
    if (bn.lt(1)) return trimZero(bn.toFixed(4))
    return addThousandSeparators(trimZero(bn.toFixed(2)))
}
