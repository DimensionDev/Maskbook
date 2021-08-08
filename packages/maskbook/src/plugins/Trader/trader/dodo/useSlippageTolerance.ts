import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_SETTINGS_MAX, SLIPPAGE_SETTINGS_MIN } from '../../constants'
import { currentSlippageSettings } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    return clamp(slippage_, SLIPPAGE_SETTINGS_MIN, SLIPPAGE_SETTINGS_MAX)
}
