import { clamp } from 'lodash-unified'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_MAX, SLIPPAGE_MIN } from '../../constants'
import { toUniswapPercent } from '../../helpers'
import { currentSlippageSettings } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    const slippage = clamp(slippage_, SLIPPAGE_MIN, SLIPPAGE_MAX)
    return toUniswapPercent(slippage, 10000)
}
