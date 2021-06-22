import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_TOLERANCE_MAX, SLIPPAGE_TOLERANCE_MIN } from '../../constants'
import { currentSlippageTolerance } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageTolerance)
    return clamp(slippage_, SLIPPAGE_TOLERANCE_MIN, SLIPPAGE_TOLERANCE_MAX)
}
