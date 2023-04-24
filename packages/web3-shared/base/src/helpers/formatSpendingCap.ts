import { isGreaterThan, isLessThan } from './number.js'

/**
 * Fetched Spending cap where it is already decimals-handled.
 * @param amount
 */
export function formatSpendingCap(amount: number) {
    return isGreaterThan(amount, '1e+10') ? 'Infinite' : isLessThan(amount, '1e-6') ? '< 0.000001' : amount
}
