import type { BigNumberish } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'

export function formatBalance(value: BigNumberish, uint?: string | BigNumberish, fraction: number = 6) {
    const formatted = formatUnits(value, uint)
    const [p1, p2] = formatted.split('.')

    if (fraction === 0) return p1
    if (fraction > 0 && p2) return `${p1}.${p2.slice(0, fraction).padEnd(fraction, '0')}`
    if (fraction > 0 && !p2) return `${p1}.${'0'.repeat(fraction)}`
    return formatted
}
