import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_TOLERANCE_MAX, SLIPPAGE_TOLERANCE_MIN } from '../../constants'
import { toUniswapPercent } from '../../helpers'
import { currentSlippageToleranceSettings } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageToleranceSettings)
    const slippage = clamp(slippage_, SLIPPAGE_TOLERANCE_MIN, SLIPPAGE_TOLERANCE_MAX)
    return toUniswapPercent(slippage, 10000)
}
