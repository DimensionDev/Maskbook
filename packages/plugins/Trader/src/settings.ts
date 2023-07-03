import { createGlobalSettings } from '@masknet/shared-base'
import { PLUGIN_ID, SLIPPAGE_DEFAULT } from './constants/index.js'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings = createGlobalSettings(`${PLUGIN_ID}+slippageTolerance`, SLIPPAGE_DEFAULT)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings = createGlobalSettings(`${PLUGIN_ID}+singleHopOnly`, false)
