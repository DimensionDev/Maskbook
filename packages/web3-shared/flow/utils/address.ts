import { getEnumAsArray } from '@dimensiondev/kit'
import { ChainId } from '../types'

export function formatAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    if (size === 0 || size >= 8) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export function isValidAddress(address: string) {
    return /0x\w{16}/.test(address)
}

export function isValidChainId(chainId: number) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}
