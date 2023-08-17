import { ProtocolType, decodeBase58Address } from './decodeBitcoinAddress.js'

export function isValidDogecoinAddress(address?: string): address is string {
    if (!address) return false
    return !!decodeBase58Address(ProtocolType.Dogecoin, address)
}
