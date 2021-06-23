import TRADE_CONSTANTS from './trade-constants.json'
import TOKEN_CONSTANTS from './token-constants.json'
import { hookTransform, transform } from './utils'

export const getTradeConstants = transform(TRADE_CONSTANTS)
export const useTradeConstants = hookTransform(getTradeConstants)

export const getTokenConstants = transform(TOKEN_CONSTANTS)
export const useTokenConstants = hookTransform(getTokenConstants)
