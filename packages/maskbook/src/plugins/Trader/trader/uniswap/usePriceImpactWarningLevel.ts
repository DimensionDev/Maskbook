import { useMemo } from 'react'
import type BigNumber from 'bignumber.js'
import {
    UNISWAP_PRICE_IMPACT_HIGH,
    UNISWAP_PRICE_IMPACT_MEDIUM,
    UNISWAP_PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from '../../constants'
import { WarningLevel } from '../../types/uniswap'

export function usePriceImpactWarningLevel(priceImpact: BigNumber) {
    return useMemo(() => {
        if (priceImpact.isGreaterThan(WarningLevel.BLOCKED)) return WarningLevel.BLOCKED
        if (priceImpact.isGreaterThan(UNISWAP_PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN))
            return WarningLevel.CONFIRMATION_REQUIRED
        if (priceImpact.isGreaterThan(UNISWAP_PRICE_IMPACT_HIGH)) return WarningLevel.HIGH
        if (priceImpact.isGreaterThan(UNISWAP_PRICE_IMPACT_MEDIUM)) return WarningLevel.MEDIUM
        return WarningLevel.LOW
    }, [priceImpact.toFixed()])
}
