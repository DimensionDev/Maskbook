import { BigNumber } from 'bignumber.js'

export function formatInteger(value: BigNumber.Value | null | undefined, fallback?: string | number) {
    if (value === undefined || value === null) return fallback
    const result = new BigNumber(typeof value === 'string' ? value.replaceAll(',', '') : value)
    return result.isNaN() ? fallback : result.toFormat(0)
}
