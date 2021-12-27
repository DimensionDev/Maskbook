import { getEnumAsArray } from '@dimensiondev/kit'
import { toArray } from 'lodash-unified'
import { EthereumAddress } from 'wallet.ts'
import { getRedPacketConstants, getTokenConstants, ZERO_ADDRESS } from '../constants'
import { ChainId } from '../types'

export function isSameAddress(source = '', target = '') {
    if (!source || !target) return false
    return source.toLowerCase() === target.toLowerCase()
}

export function currySameAddress(addresses: string | string[] = []) {
    addresses = toArray(addresses).map((address) => address.toLowerCase())
    return (target?: string | { address: string }) => {
        if (addresses.length === 0 || !target) return false
        if (typeof target === 'string') {
            return addresses.includes(target.toLowerCase())
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return addresses.includes(target.address.toLowerCase())
        }
        throw new Error('Unsupported `target` address format')
    }
}

export const isZeroAddress = currySameAddress(ZERO_ADDRESS)

export const isNative = currySameAddress(
    getEnumAsArray(ChainId).map(({ value }) => getTokenConstants(value).NATIVE_TOKEN_ADDRESS!),
)

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
