import { clamp } from 'lodash-es'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { MAX_SLIPPAGE_TOLERANCE, MIN_SLIPPAGE_TOLERANCE } from '../../constants'
import { toUniswapPercent } from '../../helpers'
import { currentSlippageTolerance } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageTolerance)
    const slippage = clamp(slippage_, MIN_SLIPPAGE_TOLERANCE, MAX_SLIPPAGE_TOLERANCE)
    return toUniswapPercent(slippage, 10000)
}
