import { clamp } from 'lodash-unified'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_MAX, SLIPPAGE_MIN } from '../../constants'
import { currentSlippageSettings } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    return clamp(slippage_, SLIPPAGE_MIN, SLIPPAGE_MAX)
}
