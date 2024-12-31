import { formatCompact, isLessThan, isZero, leftShift } from '@masknet/web3-shared-base'
import { type BigNumber } from 'bignumber.js'

export function formatTokenAmount(raw: BigNumber.Value, decimals = 0) {
    const amount = leftShift(raw, decimals).toNumber()

    if (isZero(amount)) return '0'
    if (isLessThan(amount, 0.0001)) return '<0.0001'

    return formatCompact(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits: amount < 100 ? 4 : 2,
    })
}
