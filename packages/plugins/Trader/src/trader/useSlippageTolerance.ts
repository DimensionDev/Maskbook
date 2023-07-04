import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared-base-ui'
import { currentSlippageSettings } from '../settings.js'
import { SLIPPAGE_MAX, SLIPPAGE_MIN } from '../constants/index.js'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    return clamp(slippage_, SLIPPAGE_MIN, SLIPPAGE_MAX)
}
