import { clamp } from 'lodash-unified'
import { useValueRef } from '@masknet/shared-base-ui'
import { SLIPPAGE_MAX, SLIPPAGE_MIN } from '../../constants/index.js'
import { currentSlippageSettings } from '../../settings.js'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    return clamp(slippage_, SLIPPAGE_MIN, SLIPPAGE_MAX)
}
