/* cspell:disable */
import { ProtocolType, decodeBase58Address, decodeBech32Address } from './decodeBitcoinAddress.js'

export function isValidBitcoinAddress(address?: string): address is string {
    if (!address) return false
    const prefix = address.slice(0, 2).toLowerCase()
    if (prefix === 'bc' || prefix === 'tb') return !!decodeBech32Address(ProtocolType.Bitcoin, address)
    return !!decodeBase58Address(ProtocolType.Bitcoin, address)
}
