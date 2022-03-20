import type BigNumber from 'bignumber.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { currentSlippageSettings } from '../../../settings'
import { useMemo } from 'react'
import { multipliedBy, isGreaterThan } from '@masknet/web3-shared-base'
import { AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'

export const useGreatThanSlippageSetting = (priceImpact?: BigNumber.Value) => {
    const slippageSetting = useValueRef(currentSlippageSettings)
    const { temporarySlippage } = AllProviderTradeContext.useContainer()

    const slippage = temporarySlippage || slippageSetting

    return useMemo(
        () =>
            isGreaterThan(
                multipliedBy(priceImpact ?? 0, 10000)
                    .toFixed(0)
                    .replace(/\.?0+$/, ''),
                slippage,
            ),
        [priceImpact, slippage],
    )
}
