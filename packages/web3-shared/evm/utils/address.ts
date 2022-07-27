import { EthereumAddress } from 'wallet.ts'
import { getEnumAsArray } from '@dimensiondev/kit'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getRedPacketConstants, getTokenConstant, ZERO_ADDRESS } from '../constants'
import { ChainId } from '../types'

export function isEmptyHex(hex?: string) {
    return !hex || ['0x', '0x0'].includes(hex)
}

export function isValidAddress(address?: string) {
    if (!address) return false
    return EthereumAddress.isValid(address)
}

export function isValidChainId(chainId: ChainId) {
    return getEnumAsArray(ChainId).some((x) => x.value === chainId)
}

export function isZeroAddress(chainId: ChainId, address?: string) {
    return isSameAddress(address, ZERO_ADDRESS)
}

export function isNativeTokenAddress(chainId: ChainId, address?: string) {
    return isSameAddress(address, getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS'))
}

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

export function getMaskTokenAddress(chainId: ChainId) {
    return getTokenConstant(chainId, 'MASK_ADDRESS')
}
