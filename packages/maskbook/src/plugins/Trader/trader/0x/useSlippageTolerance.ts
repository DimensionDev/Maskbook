import { clamp } from 'lodash-es'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { MAX_SLIPPAGE_TOLERANCE, MIN_SLIPPAGE_TOLERANCE } from '../../constants'
import { currentSlippageTolerance } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageTolerance)
    return clamp(slippage_, MIN_SLIPPAGE_TOLERANCE, MAX_SLIPPAGE_TOLERANCE)
}
