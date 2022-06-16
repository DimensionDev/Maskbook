import { useAsync } from 'react-use'
import { calculateActualOdds } from '@azuro-protocol/sdk'
import type { Odds } from '../types'

export function useActualRate(condition: Odds, amount: string) {
    return useAsync(async () => {
        if (!condition || !amount) return
        return calculateActualOdds({
            conditionId: condition.conditionId,
            outcomeId: condition.outcomeId,
            betAmount: Number(amount),
        })
    }, [amount, condition])
}
