import { addThousandSeparators, isLessThan, isZero, leftShift } from '@masknet/web3-shared-base'
import { type BigNumber } from 'bignumber.js'

/**
 * Yet another formatBalance
 */
export function formatBalance2(balance: BigNumber.Value = '0', decimals = 1) {
    if (isZero(balance)) return '0'
    const bn = leftShift(balance, decimals)
    if (isLessThan(bn, 0.0001)) return '<0.0001'
    if (isLessThan(bn, 1)) return bn.toFixed(4)
    return addThousandSeparators(bn.toFixed(2))
}
