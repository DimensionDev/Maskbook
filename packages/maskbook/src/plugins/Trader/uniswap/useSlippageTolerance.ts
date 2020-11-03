import { DEFAULT_SLIPPAGE_TOLERANCE } from '../constants'

/**
 * Maybe we should support settings panel in unswap trader
 * We can fetch it from other place instead of a dead code constant
 */
export function useSlippageTolerance() {
    return DEFAULT_SLIPPAGE_TOLERANCE
}
