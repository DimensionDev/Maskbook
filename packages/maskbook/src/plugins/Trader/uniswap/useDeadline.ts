import { DEFAULT_TRANSACTION_DEADLINE } from '../constants'

/**
 * Maybe we should support settings panel in unswap trader
 * We can fetch it from other place instead of a dead code constant
 */
export function useTransactionDeadline() {
    return DEFAULT_TRANSACTION_DEADLINE
}
