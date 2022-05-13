import { toFixed } from '@masknet/web3-shared-base'
import type BigNumber from 'bignumber.js'

export function formatAddress(address: string, size = 0) {
    if (size === 0 || size >= 22) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export function formatCurrency(value: BigNumber.Value, sign = '') {
    const digits = toFixed(value)
    return `${sign}${digits}`
}
