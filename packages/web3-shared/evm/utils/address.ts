import { EthereumAddress } from 'wallet.ts'
import { getRedPacketConstants, getTokenConstants } from '../constants'

export function isSameAddress(addrA: string = '', addrB: string = '') {
    if (!addrA || !addrB) return false
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function currySameAddress(base?: string) {
    return (target: string | { address: string }) => {
        if (!base) return false
        if (typeof target === 'string') {
            return isSameAddress(base, target)
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return isSameAddress(base, target.address)
        }
        throw new Error('Unsupported `target` address format')
    }
}

export const isNative = currySameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS)

export function isRedPacketAddress(address: string, version?: 1 | 2 | 3 | 4) {
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = getRedPacketConstants()

    switch (version) {
        case 1:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address)
        case 2:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address)
        case 3:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address)
        case 4:
            return isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)
        default:
            return (
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address) ||
                isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)
            )
    }
}

export function isValidAddress(address?: string) {
    if (!address) return false
    return EthereumAddress.isValid(address)
}
