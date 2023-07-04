import { clamp } from 'lodash-es'
import { useValueRef } from '@masknet/shared-base-ui'
import { uniswap } from '@masknet/web3-providers/helpers'
import { SLIPPAGE_MAX, SLIPPAGE_MIN } from '../../constants/index.js'
import { currentSlippageSettings } from '../../settings.js'

export function useSlippageTolerance() {
    const slippage_ = useValueRef(currentSlippageSettings)
    const slippage = clamp(slippage_, SLIPPAGE_MIN, SLIPPAGE_MAX)
    return uniswap.toUniswapPercent(slippage, 10000)
}
