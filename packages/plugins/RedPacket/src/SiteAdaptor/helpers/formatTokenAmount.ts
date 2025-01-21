import { formatCompact, isLessThan, isZero, leftShift } from '@masknet/web3-shared-base'
import { type BigNumber } from 'bignumber.js'

export function formatTokenAmount(raw: BigNumber.Value, decimals = 0, round = true) {
    let amount = leftShift(raw, decimals).toNumber()

    if (isZero(amount)) return '0'
    if (isLessThan(amount, 0.0001)) return '<0.0001'

    const maximumFractionDigits = amount < 100 ? 4 : 2
    if (!round) {
        const [integer, decimal] = amount.toString().split('.')
        if (decimal?.length > maximumFractionDigits) {
            amount = +(integer + '.' + decimal.slice(0, maximumFractionDigits))
        }
    }

    return formatCompact(amount, {
        minimumFractionDigits: 2,
        maximumFractionDigits,
    })
}
