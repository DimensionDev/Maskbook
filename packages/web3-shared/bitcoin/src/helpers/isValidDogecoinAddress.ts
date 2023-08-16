import { ProtocolType, deocdeBase58Address, decodeBech32Address } from './decodeBitcoinAddress.js'

export function isValidDogecoinAddress(address?: string): address is string {
    if (!address) return false
    const prefix = address.slice(0, 2).toLowerCase()
    if (prefix === 'bc' || prefix === 'tb') return !!decodeBech32Address(ProtocolType.Dogecoin, address)
    return !!deocdeBase58Address(ProtocolType.Dogecoin, address)
}
