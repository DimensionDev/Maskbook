import { useAsync } from 'react-use'
import { calculateActualOdds } from '@azuro-protocol/sdk'
import type { Odds } from '../types'
import BigNumber from 'bignumber.js'

export function useActualRate(condition: Odds, amount: string) {
    return useAsync(async () => {
        if (!condition || !amount) return
        const betAmount = new BigNumber(amount)
        return calculateActualOdds({
            conditionId: condition.conditionId,
            outcomeId: condition.outcomeId,
            betAmount: betAmount.toNumber(),
        })
    }, [amount, condition])
}
