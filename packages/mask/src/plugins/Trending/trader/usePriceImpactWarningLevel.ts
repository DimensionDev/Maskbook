import { useMemo } from 'react'
import type BigNumber from 'bignumber.js'
import { PRICE_IMPACT_HIGH, PRICE_IMPACT_MEDIUM, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '../constants'
import { WarningLevel } from '../types'

export function usePriceImpactWarningLevel(priceImpact: BigNumber) {
    return useMemo(() => {
        if (priceImpact.isGreaterThan(WarningLevel.BLOCKED)) return WarningLevel.BLOCKED
        if (priceImpact.isGreaterThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) return WarningLevel.CONFIRMATION_REQUIRED
        if (priceImpact.isGreaterThan(PRICE_IMPACT_HIGH)) return WarningLevel.HIGH
        if (priceImpact.isGreaterThan(PRICE_IMPACT_MEDIUM)) return WarningLevel.MEDIUM
        return WarningLevel.LOW
    }, [priceImpact.toFixed()])
}
