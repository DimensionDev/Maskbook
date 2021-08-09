import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared'
import { SLIPPAGE_SETTINGS_MAX, SLIPPAGE_SETTINGS_MIN } from '../../constants'
import { toUniswapPercent } from '../../helpers'
import { currentSlippageSettings } from '../../settings'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    const slippage = clamp(slippage_, SLIPPAGE_SETTINGS_MIN, SLIPPAGE_SETTINGS_MAX)
    return toUniswapPercent(slippage, 10000)
}
